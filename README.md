# phonegap-splash

Automatic splash screen generator for PhoneGap. Create a splash screen (2208x2208) once in the www folder of your phonegap project and use phonegap-splash to automatically crop and copy it for all the platforms your project supports (currenty works with iOS and Android).

### Installation

    sudo npm install -g phonegap-splash

### Usage

Create a ```splash.png``` file in the www folder of your phonegap project and run:

    phonegap-splash

### Requirements

- ImageMagick

Install on a Mac:

    brew update
    brew install imagemagick

- At least one platform was added to your project ([phonegap platforms docs](http://phonegap.apache.org/docs/en/3.4.0/guide_platforms_index.md.html#Platform%20Guides))
- PhoneGap's config.xml file must exist in the root folder ([phonegap config.xml docs](http://phonegap.apache.org/docs/en/3.4.0/config_ref_index.md.html#The%20config.xml%20File))

### License

MIT

### Future Development

- Generate icons and splash at same time.
- Add other platforms.