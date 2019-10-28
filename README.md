# CastServer

A Node.js server and single page application for browsing and casting media.

## Origin

This project comes from an unsatisfactory experience with several "media browsing and casting" apps which fall short of the usability and performance I expect. I am fed up with devices sleeping apps (regardless of settings) and therefore the streaming music stops or playlists being lost. I am fed up with connections to casting devices being lost and unable to restore the connections without reseting the devices and apps.

I am a software developer and I can do something about this. Also I found that I can achieve this with Node.js and get to work with web technologies that I have not previously practiced.

## Objective

To run a service on a Raspbery Pi that can maintain:
- connection to multiple media sources (currently just a MiniDLNA server)
  - so that the media can be browsed
  - or searched
  
- connection to multiple casting devices (currently just Google Chromecasts)
- multiple playlists
  - which are remembered forever or until they are cleared
- support multiple different types of clients
  - smartphones
  - tablets
  - laptops
  - etc.

