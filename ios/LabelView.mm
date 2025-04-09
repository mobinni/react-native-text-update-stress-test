#import "LabelView.h"

#import <Label/ComponentDescriptors.h>
#import <Label/EventEmitters.h>
#import <Label/Props.h>
#import <Label/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface LabelView () <RCTLabelViewViewProtocol>

@end

@implementation LabelView {
    UIView * _view;
    UILabel * _label;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LabelViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LabelViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    // Create and configure the label
    _label = [[UILabel alloc] init];
    _label.translatesAutoresizingMaskIntoConstraints = NO; // Important for Auto Layout
    [_view addSubview:_label];

    // Add constraints to make label fill the view
    [NSLayoutConstraint activateConstraints:@[
        [_label.topAnchor constraintEqualToAnchor:_view.topAnchor],
        [_label.bottomAnchor constraintEqualToAnchor:_view.bottomAnchor],
        [_label.leadingAnchor constraintEqualToAnchor:_view.leadingAnchor],
        [_label.trailingAnchor constraintEqualToAnchor:_view.trailingAnchor]
    ]];


    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<LabelViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<LabelViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor:[self hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTLabelViewHandleCommand(self, commandName, args);
}


Class<RCTComponentViewProtocol> LabelViewCls(void)
{
    return LabelView.class;
}

- hexStringToColor:(NSString *)stringToConvert
{
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) return nil;
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;

    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

- (void)updateLabel:(NSString *)text {
    dispatch_async(dispatch_get_main_queue(), ^{
      self->_label.text = text;
    });
}

@end
