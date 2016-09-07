streamStateEventListeners = {}
streamState =
  streamStart:0
  streamDuration:0
  playDuration:0
  PLAY_DURATION:'play duration changed'
  emit: (name, data...) ->
    if streamStateEventListeners[name]?
      for listener in streamStateEventListeners[name]
        listener data...
    return

  on: (name, listener) ->
    if streamStateEventListeners[name]?
      streamStateEventListeners[name].push listener
    else
      streamStateEventListeners[name] = [ listener ]

module.exports = streamState