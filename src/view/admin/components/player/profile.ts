import Component from "vue-class-component";
import {VueEx} from "../../../VueEx";
import {StagePlayerCard} from "../../../panel/render/PlayerRender";
import {PlayerInfo} from "../../../../model/PlayerInfo";
import {ViewEvent} from "../../../../event/Const";
import WatchOption = vuejs.WatchOption;
declare var Cropper;
var _this_:Profile;
@Component({
    template: require('./profile.html'),
    props: {
        name: {
            type: String,
            required: true,
            default: '斯蒂芬库里'
        },
        realName: {
            type: String,
            default: ""
        },
        size: {
            type: String,
            default: ""
        },
        phone: {
            type: Number,
        },
        qq: {
            type: Number,
        },
        height: {
            type: Number,
            default: 178
        },
        weight: {
            type: Number,
            default: 70
        },
        eloScore: {
            type: Number,
            required: true,
            default: 2000
        },
        style: {
            type: Number,
            required: true,
            default: 1
        }
    },
    watch: {
        name: (val) => {
            if (_this_.bluePlayerCard) {
                _this_.bluePlayerCard.setName(val);
                _this_.redPlayerCard.setName(val);
            }

        },
        eloScore: (val) => {
            if (_this_.bluePlayerCard) {
                _this_.bluePlayerCard.setEloScore(val);
                _this_.redPlayerCard.setEloScore(val);
            }

        },
        style: (val) => {
            if (_this_.bluePlayerCard) {
                _this_.bluePlayerCard.setStyle(val);
                _this_.redPlayerCard.setStyle(val);
            }
        },
    }
})
export class Profile extends VueEx {
    imagePath:string;
    playerInfo:PlayerInfo;
    stage:any;
    bluePlayerCard:StagePlayerCard;
    redPlayerCard:StagePlayerCard;
    cropper:any;
    //props
    eloScore:number;
    name:string;
    realName:string;
    style:number;
    phone:number;
    weight:number;
    height:number;
    qq:number;
    avatar:string;
    size:string;
    //

    isEdit:boolean;
    editPlayerId:number;
    isChangeAvatar:boolean;

    ready() {
        _this_ = this;

        this.isEdit = false;
        this.isChangeAvatar = false;

        this.$on(ViewEvent.PLAYER_EDIT, (playerId) => {
            this.isEdit = true;
            this.isChangeAvatar = false;
            this.post(`/db/player/${playerId}`, (data) => {
                console.log('res: ', data);
                var playerDoc = data.playerDoc;
                this.editPlayerId = playerDoc.id;
                this.stage = this.initCanvas(playerDoc.avatar, 1);
                this.setProp(playerDoc, this);
                this.avatar = playerDoc.avatar;
            });
            console.log(ViewEvent.PLAYER_EDIT, playerId);
        })
    }

    setProp(data, toObj) {
        toObj.name = data.name;
        toObj.realName = data.realName;
        toObj.phone = data.phone;
        toObj.qq = data.qq;
        toObj.eloScore = data.eloScore;
        toObj.style = data.style;
        toObj.weight = data.weight;
        toObj.height = data.height;
        toObj['size'] = data.size;
    }

    onDeletePlayer() {
        console.log('onDeletePlayer');
        this.post('/admin/player/delete', {id: this.editPlayerId}, function (res) {
            if (res == "OK") {
                console.log('delete sus');
                window.location.reload();
            }
            else
                console.error('delete failed');
        })

    }

    onSubmitInfo(event) {
        event.stopPropagation();
        console.log('onSubmitInfo');
        $(".cropper-container").hide();
        var playerDoc:any = {};
        this.setProp(this, playerDoc);
        if (this.isEdit) {
            var postUpdate = () => {
                this.post('/admin/player/update', {playerDoc: playerDoc}, (res) => {
                    console.log(res);
                    this.isEdit = false;
                    if (res) {
                        window.location.reload();
                    }
                })
            };


            playerDoc.id = this.editPlayerId;
            if (this.isChangeAvatar) {
                playerDoc.avatar = this.cropper.getCroppedCanvas().toDataURL();
                postUpdate();
                console.log('isChangeAvatar');
            }
            else {
                postUpdate();
            }

        }
        else {
            if (this.isChangeAvatar) {
                playerDoc.avatar = this.cropper.getCroppedCanvas().toDataURL();
            }
            this.$http.post('/admin/player/add', {playerData: playerDoc}, (res) => {
                console.log(res);
                if (res) {
                    window.location.reload();
                }
            })
        }

    }

    showFile(e) {
        var fr = new FileReader();
        var image = document.getElementById('image');
        console.log("showFile", e.target.files[0]);
        fr.readAsDataURL(e.target.files[0]);
        fr.onload = (e) => {
            this.isChangeAvatar = true;
            //            document.getElementById("playerAvatar").src = e.target.result;
            ///init
            this.imagePath = (e.target as any).result;
            (image as any).src = this.imagePath;

            this.stage = this.initCanvas(this.imagePath, 1);

            this.cropper = new Cropper(image, {
                aspectRatio: 180 / 76,
                crop: (e) => {
                    // console.log(e.detail.x);
                    // console.log(e.detail.y);
                    // console.log(e.detail.width);
                    // console.log(e.detail.height);
                    //            console.log(e.detail.rotate);
                    //            console.log(e.detail.scaleX);
                    //            console.log(e.detail.scaleY);
                    this.onUpdateCropPreview(e.detail);
                }
            });
        };
    }

    onUpdateCropPreview(cropData:any) {
        var scale = cropData.width / 180;
        if (this.bluePlayerCard && this.bluePlayerCard.avatarBmp) {
            this.bluePlayerCard.avatarBmp.x = -cropData.x / scale;
            this.bluePlayerCard.avatarBmp.y = -cropData.y / scale;
            this.bluePlayerCard.avatarBmp.scaleX = this.bluePlayerCard.avatarBmp.scaleY = 1 / scale;

            this.redPlayerCard.avatarBmp.x = -cropData.x / scale;
            this.redPlayerCard.avatarBmp.y = -cropData.y / scale;
            this.redPlayerCard.avatarBmp.scaleX = this.redPlayerCard.avatarBmp.scaleY = 1 / scale;
        }
    }

    initCanvas(imagePath, scale) {
        var stageWidth = 500;
        var stageHeight = 130;
        var canvas = document.getElementById("avatarPreview");
        canvas.setAttribute("width", stageWidth + "");
        canvas.setAttribute("height", stageHeight + "");
        var stage = new createjs.Stage(canvas);
        stage.autoClear = true;
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener("tick", function () {
            stage.update();
        });
        var playerInfo = new PlayerInfo();
        playerInfo.name(this.name);
        playerInfo.avatar(imagePath);
        playerInfo.eloScore(this.eloScore);
        playerInfo.style(this.style);
        playerInfo.backNumber = 30;
        this.playerInfo = playerInfo;
        var bluePlayerCard = new StagePlayerCard(playerInfo, scale);
        this.bluePlayerCard = bluePlayerCard;
        var redPlayerCard = new StagePlayerCard(playerInfo, scale, false);
        this.redPlayerCard = redPlayerCard;
        stage.addChild(bluePlayerCard);
        redPlayerCard.x = 250;
        stage.addChild(redPlayerCard);
        return stage;
    }
}
