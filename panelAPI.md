####1.更新队球员
event:"updatePlayer"
param:{
    player:{
        name:String,       //球员面板显示ID
        avatar:String,     //球员面板显示头像 尺寸为180*76
        winAmount:Number,  //球员（当前比赛）胜场数
        loseAmount:Number, //球员（当前比赛）负场数
    },
    idx:Number //左边idx 为0，右边idx 为1
}
####2.开始比赛，开始计时
event:"startGame"
param:{
    winScore:Number // 2，3，5 分制
    gameIdx:Number //比赛场次
}
####3.更新比分
event:"updateScore"
param:{
    leftScore:Number   //蓝（左）队比分
    rightScore:Number   //红（右）队比分
    }
####4.提交比赛结果，显示胜出球员
event:"commitGame"
param:{
    player:{
        name:String,       //球员面板显示ID
        avatar:String,     //球员面板显示头像 尺寸为180*76
        winAmount:Number,  //球员（当前比赛）胜场数
        loseAmount:Number, //球员（当前比赛）负场数
        weight:Number,      //球员体重
        height:Number,      //球员身高
        intro:String,      //球员一句话介绍
    },
    idx:Number //左边idx 为0，右边idx 为1
}
####5.显示球员排名
event:"fadeInAct"
param:{
    playerArr:[{
        name:String,       //球员面板显示ID
        avatar:String,     //球员面板显示头像 尺寸为180*76
        winAmount:Number,  //球员（当前比赛）胜场数
        loseAmount:Number, //球员（当前比赛）负场数
        state:Number,      //1默认状态 2选中状态 3淘汰 
    }]
}
####6.隐藏球员排名
event:"fadeOutAct"
param:null
####7.倒计时文字
event:"fadeInCountDown"
param:{
    text:String    //暂停文字
    cdSec:Number   //倒计时秒数
}
####8.倒计时文字
event:"fadeOutCountDown"
param:null
####9.滚动文字
event:"fadeInNotice"
param:{
    text:String    //滚动文字
    times:Number   //滚动次数，0无限 
}
####10.倒计时文字
event:"fadeOutNotice"
param:null

