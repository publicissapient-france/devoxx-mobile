//
//  XBViewController.h
//  devoxx
//
//  Created by Alexis Kinsella on 06/04/2014.
//  Copyright (c) 2014 Xebia. All rights reserved.
//

#import <UIKit/UIKit.h>

@class XBAppDelegate;

@interface XBViewController : UIViewController<UIWebViewDelegate>

@property (weak, nonatomic) IBOutlet UIWebView *webView;

@end
