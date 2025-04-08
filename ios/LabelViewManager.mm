#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface LabelViewManager : RCTViewManager
@end

@implementation LabelViewManager

RCT_EXPORT_MODULE(LabelView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(color, NSString)

@end
