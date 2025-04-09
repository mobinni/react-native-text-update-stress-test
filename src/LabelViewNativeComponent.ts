import codegenNativeComponent, {
  type NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  color?: string;
  text: string;
}

export default codegenNativeComponent<NativeProps>('LabelView');

export type ViewType = NativeComponentType<NativeProps>;
interface NativeCommands {
  updateLabel: (viewRef: React.ElementRef<ViewType>, text: string) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['updateLabel'],
});
