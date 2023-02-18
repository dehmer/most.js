import { newStream } from '@most/core'
import DispatchSource from './source.js'

function dispatch(f, stream) {
  const dispatcher = function(stream) {
    if(stream.source instanceof DispatchSource && stream.source.f === f) {
      return stream;
    }

    const source = new DispatchSource(stream, f);
    const streamNew = newStream(source.run.bind(source));
    streamNew.select = key => source.select(key);
    return streamNew;
  };
  return stream ? dispatcher(stream) : dispatcher;
}

export {dispatch};
