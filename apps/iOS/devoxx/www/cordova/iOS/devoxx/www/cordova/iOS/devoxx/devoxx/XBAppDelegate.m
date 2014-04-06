//
//  XBAppDelegate.m
//  devoxx
//
//  Created by Alexis Kinsella on 06/04/2014.
//  Copyright (c) 2014 Xebia. All rights reserved.
//

#import "XBAppDelegate.h"
#import "Appirater.h"

@implementation XBAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
    
    return YES;
}

- (void) applicationWillEnterForeground:(UIApplication *)application
{
    [Appirater appLaunched: YES];
}

- (void)setupApplicationRating
{
    [Appirater setAppId:@"512622380"];
    [Appirater setOpenInAppStore:NO];
    [Appirater setDaysUntilPrompt:0];
    [Appirater setUsesUntilPrompt:5];
    [Appirater setSignificantEventsUntilPrompt:-1];
    [Appirater setTimeBeforeReminding:2];
    
    [Appirater appLaunched: YES];
}

@end
