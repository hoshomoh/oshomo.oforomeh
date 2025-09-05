---
layout: post
title: Adding third party acknowledgements in your React Native App
categories:
excerpt: As an engineer it is almost impossible to build an app without using open source tools and packages. As a matter of
  transparency to your end users as well as giving proper credits and attributions to the author of the free open
  source packages you are using, you need to add an acknowledgements section in your app.
  So, how do you do this efficiently for a React-Native application?
image:
---

As an engineer it is almost impossible to build an app without using open source tools and packages. As a matter of 
transparency to your end users as well as giving proper credits and attributions to the author of the free open
source packages you are using, you need to add an acknowledgements section in your app. 
So, how do you do this efficiently for a React-Native application?

## Generating acknowledgements for iOS

On iOS, it's actually quite easy, you can add an acknowledgements group to the Settings.bundle.
{% sidenote 'settings-bundle' '**What is a Settings bundle?**<br />A Settings bundle is a special kind of bundle provided by Apple, that allows developers add their app preferences into the iOS setting app.<br /><br />The Settings bundle is considered as app resources, so everytime you build your app, the Settings bundle will be copied into your app bundle and the iOS settings app will display the app preferences based on the information in the Settings bundle. You can read more about the Settings bundle [here](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/UserDefaults/Preferences/Preferences.html).' %}

### Step I

The first step is to generate the `Settings.bundle` directory for your app. If you already generated it, you can skip this step and 
just update your `Root.plist` with an  acknowledgements section just like mine below. Follow this steps below to generate the `Settings.bundle`.

1. Open your project in Xcode.
2. Choose File -> New -> File.
3. Under iOS, search for `Settings Bundle`.
4. Click on the Settings Bundle and click the `Next` button.
5. Name the file Settings and click on the `Create` button.

This steps above will create a `Settings.bundle` directory in the ios directory of your react native app. 
This directory will contain a `Root.plist` file, open this file in your code editor and update the content with the 
one below.

 ```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>PreferenceSpecifiers</key>
        <array>
            <dict>
                <key>DefaultValue</key>
                <string>1.0.3</string>
                <key>Key</key>
                <string>version_preference</string>
                <key>Title</key>
                <string>Version</string>
                <key>Type</key>
                <string>PSTitleValueSpecifier</string>
            </dict>
            <dict>
                <key>File</key>
                <string>Acknowledgements</string>
                <key>Title</key>
                <string>Acknowledgements</string>
                <key>Type</key>
                <string>PSChildPaneSpecifier</string>
            </dict>
        </array>
        <key>StringsTable</key>
        <string>Root</string>
    </dict>
</plist>
```

{% marginfigure 'settting-bundle-ios-settings' 'assets/img/posts/ios-setting-bundle.png' 'If you open the iOs settings app, find your app from the list and click on it, you should see something that looks like this' %}

### Step II

The second step is to actually generate the Acknowledgements. There are various ways to do this, but what I have found to work perfectly for me is the Node.js script below.

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const checker = require('license-checker');
const { create } = require('xmlbuilder2');

/**
 * The current app version 
 * 
 * @type {string}
 */
const APP_VERSION = "1.0.3";

/**
 * The folder where we can find node_modules dir
 * 
 * @type {string}
 */
const NODE_MODULE_ROOT_DIR = path.join(__dirname, '../');

/**
 * The IOS Setting Bundle dir
 * 
 * @type {string}
 */
const IOS_SETTINGS_BUNDLE_DIR = path.join(__dirname, '../ios/Settings.bundle/');

/**
 * The prefix added to the generated licenses file
 * 
 * @type {string}
 */
const LICENSE_PLIST_PREFIX = 'Acknowledgement-';

/**
 * Delete previously generated files
 *
 * @param pattern
 */
const deleteDirFilesUsingPattern = pattern => {
    // get all file names in directory
    fs.readdir(IOS_SETTINGS_BUNDLE_DIR, (err, fileNames) => {
        if (err) {
            throw err;
        }

        for (const name of fileNames) {
            if (name.startsWith(LICENSE_PLIST_PREFIX)) {
                fs.unlink(path.join(IOS_SETTINGS_BUNDLE_DIR, name), error => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
    });
};

/**
 * Get licences in the supplied path
 *
 * @param start
 * @returns {Promise<unknown>}
 */
const getLicensesFromPath = start =>
    new Promise((resolve, reject) =>
        checker.init(
            {
                start,
                production: true,
                customFormat: {
                    name: '',
                    version: '',
                    description: '',
                    url: '',
                    licenses: '',
                    licenseFile: '',
                    licenseText: '',
                    licenseModified: '',
                },
                excludePrivatePackages: true,
            },
            (err, json) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(json);
                }
            },
        ),
    );

/**
 * Convert an object to Apple Plist File
 *
 * @param content
 * @returns {string}
 */
const convertObjectToAppleXml = content => {
    const doc = create({ encoding: 'UTF-8' }, content);
    return doc
        .dtd({
            name: 'plist',
            pubID: '-//Apple//DTD PLIST 1.0//EN',
            sysID: 'http://www.apple.com/DTDs/PropertyList-1.0.dtd',
        })
        .end({ prettyPrint: true });
};

/**
 * Convert object to apple plist xml and write to filename
 *
 * @param filename
 * @param content
 */
const writePlistFileToSettingsBundle = (filename, content) => {
    fs.writeFileSync(
        path.join(IOS_SETTINGS_BUNDLE_DIR, `${filename}.plist`),
        convertObjectToAppleXml(content),
        { encoding: 'utf8', flag: 'w+' },
    );
};

/**
 * 1. Delete previously generated licenses
 * 2. Get licences from current dir node_modules
 */
(async () => {
    const visitedLicences = new Set();
    deleteDirFilesUsingPattern();
    const result = await getLicensesFromPath(NODE_MODULE_ROOT_DIR);

    const rootPlist = {
        plist: {
            '@version': '1.0',
            dict: {
                '#': [
                    { key: 'StringsTable' },
                    { string: 'Root' },
                    { key: 'PreferenceSpecifiers' },
                    {
                        array: {
                            dict: [
                                {
                                    '#': [
                                        { key: 'DefaultValue' },
                                        { string: APP_VERSION },
                                        { key: 'Key' },
                                        { string: 'version_preference' },
                                        { key: 'Title' },
                                        { string: 'Version' },
                                        { key: 'Type' },
                                        { string: 'PSTitleValueSpecifier' },
                                    ],
                                },
                                {
                                    '#': [
                                        { key: 'File' },
                                        { string: 'Acknowledgements' },
                                        { key: 'Title' },
                                        { string: 'Acknowledgements' },
                                        { key: 'Type' },
                                        { string: 'PSChildPaneSpecifier' },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        },
    };

    const acknowledgementPlist = {
        plist: {
            '@version': '1.0',
            dict: {
                '#': [
                    { key: 'StringsTable' },
                    { string: 'ThirdPartyLicenses' },
                    { key: 'PreferenceSpecifiers' },
                    {
                        array: {
                            dict: [],
                        },
                    },
                ],
            },
        },
    };

    Object.values(result).forEach(license => {
        const licenceAcknowledgementPlistFileName = `${LICENSE_PLIST_PREFIX}${license.name.replace(
            '/',
            '-',
        )}`;

        /**
         * Skip for empty licences and already generated licenses
         */
        if (
            !license.licenseText ||
            visitedLicences.has(licenceAcknowledgementPlistFileName)
        ) {
            return;
        }

        const licenceAcknowledgementPlist = {
            plist: {
                '@version': '1.0',
                dict: {
                    '#': [
                        { key: 'StringsTable' },
                        { string: 'ThirdPartyLicenses' },
                        { key: 'PreferenceSpecifiers' },
                        {
                            array: {
                                dict: [
                                    {
                                        '#': [
                                            { key: 'Type' },
                                            { string: 'PSGroupSpecifier' },
                                            { key: 'FooterText' },
                                            { string: license.licenseText },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        };

        /**
         * Generate the plist for the license
         */
        writePlistFileToSettingsBundle(
            licenceAcknowledgementPlistFileName,
            licenceAcknowledgementPlist,
        );

        /**
         * Add the license plist file to the acknowledgement plist
         */
        acknowledgementPlist.plist.dict['#'][3].array.dict.push({
            '#': [
                { key: 'Type' },
                { string: 'PSChildPaneSpecifier' },
                { key: 'Title' },
                { string: license.name },
                { key: 'File' },
                { string: licenceAcknowledgementPlistFileName },
            ],
        });

        visitedLicences.add(licenceAcknowledgementPlistFileName);
    });

    /**
     * Generate the acknowledgement plist file
     */
    writePlistFileToSettingsBundle('Acknowledgements', acknowledgementPlist);

    /**
     * Generate the root plist file
     */
    writePlistFileToSettingsBundle('Root', rootPlist);
})();
```

The script above assumes that it was saved in a directory at the root of you React-Native application. 
Personally, I have a `scripts/` directory in the application root where I store all scripts like this one.
You can however choose to save this wherever you like. But, you might need to update the `NODE_MODULE_ROOT_DIR` and 
`IOS_SETTINGS_BUNDLE_DIR` constant values of the script.

The script will generate acknowledgement files for all the open source packages you are using as found in your node_modules folder.
The generated files will be stored in the directory specified in the `IOS_SETTINGS_BUNDLE_DIR` constant. The script will also generate
and replace the existing Root.plist file, so if you have an existing file with a custom structure, you might want to tweak this script 
to match the structure of your Root.plist file.