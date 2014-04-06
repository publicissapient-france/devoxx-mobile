//
//  XBViewController.m
//  devoxx
//
//  Created by Alexis Kinsella on 06/04/2014.
//  Copyright (c) 2014 Xebia. All rights reserved.
//

#import "XBViewController.h"
#import "XBAppDelegate.h"

@interface XBViewController ()

@end

@implementation XBViewController

- (void)viewDidLoad
{
    [super viewDidLoad];

    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"index" ofType:@"html" inDirectory:@"www"]];
    [self.webView loadRequest:[NSURLRequest requestWithURL:url]];
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    return UIStatusBarStyleDefault;
}

@end
