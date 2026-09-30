import { NativeModule, requireNativeModule } from 'expo';

declare class MiadNotifyModule extends NativeModule<{}> {}

export default requireNativeModule<MiadNotifyModule>('MiadNotify');
