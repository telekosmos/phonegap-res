# phonegap-splash

Automatic splash screen generator for phonegap. Create a splash screen (2208x2208) once in the root folder of your phonegap project and use phonegap-splash to automatically crop and copy it for all the platforms your project supports (currenty works with iOS and Android).

### Installation

     $ sudo npm install phonegap-splash -g

### Usage

Create a ```splash.png``` file in the root folder of your phonegap project and run:

     $ phonegap-splash

### Requirements

- ImageMagick

Install on a Mac:

     $ brew install imagemagick

- At least one platform was added to your project ([phonegap platforms docs](http://phonegap.apache.org/docs/en/3.4.0/guide_platforms_index.md.html#Platform%20Guides))
- phonegap's config.xml file must exist in the root folder ([phonegap config.xml docs](http://phonegap.apache.org/docs/en/3.4.0/config_ref_index.md.html#The%20config.xml%20File))

### License

MIT
