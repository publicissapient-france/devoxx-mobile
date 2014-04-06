//
// Created by Alexis Kinsella on 25/02/2014.
// Copyright (c) 2014 Xebia IT Architects. All rights reserved.
//

#import "XBWebBrowser.h"
#import "TSMiniWebBrowser+protected.h"

@interface XBWebBrowser ()

@property(nonatomic, assign) UIStatusBarStyle originalBarStyle;

@end

// UIBarStyle backup is bugged, save original bar style to restore it, when view disapears
@implementation XBWebBrowser

- (id)initWithUrl:(NSURL *)url
{
    self = [super initWithUrl:url];
    if (self) {
        self.delegate = self;
        self.barStyle = UIBarStyleBlack;
    }

    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
}

// Fix translucent bar issue
-(void) initTitleBar {
    [super initTitleBar];
    UINavigationBar *navigationBarModal = [self valueForKey:@"navigationBarModal"];
    navigationBarModal.translucent = NO;
}

- (void)viewWillAppear:(BOOL)animated
{
    self.originalBarStyle = [UIApplication sharedApplication].statusBarStyle;

    [super viewWillAppear:animated];

    [[UIApplication sharedApplication] setStatusBarHidden:YES];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [[UIApplication sharedApplication] setStatusBarStyle:self.originalBarStyle animated:NO];
    [[UIApplication sharedApplication] setStatusBarHidden:NO];
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void)dismissController
{
    if (webView.loading) {
        [webView stopLoading];
    }

    [self dismissViewControllerAnimated:YES completion:^{}];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
{
    [super hideActivityIndicators];
}


@end