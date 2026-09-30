import { registerWebModule, NativeModule } from 'expo';

// MiadNotifyModule is not available on the web platform.
class MiadNotifyModule extends NativeModule<{}> {}

export default registerWebModule(MiadNotifyModule, 'MiadNotifyModule');
