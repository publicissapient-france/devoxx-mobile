//
//  XBViewController.m
//  devoxx
//
//  Created by Alexis Kinsella on 06/04/2014.
//  Copyright (c) 2014 Xebia. All rights reserved.
//

#import "XBViewController.h"
#import "XBWebBrowser.h"

@interface XBViewController ()

@end

@implementation XBViewController

- (void)viewDidLoad
{
    [super viewDidLoad];

    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"index" ofType:@"html" inDirectory:@"www"]];
    self.webView.delegate = self;
    [self.webView loadRequest:[NSURLRequest requestWithURL:url]];
    self.webView.scrollView.bounces = NO;
}


- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    if (![request.mainDocumentURL.scheme isEqualToString:@"file"]) {
        XBWebBrowser *webBrowser = [[XBWebBrowser alloc] initWithUrl:request.mainDocumentURL];
        webBrowser.mode = TSMiniWebBrowserModeModal;
        webBrowser.showPageTitleOnTitleBar = YES;

        [self presentViewController:webBrowser animated:YES completion:^{ }];

        return NO;
    }

    return YES;
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    return UIStatusBarStyleLightContent;
}

@end
