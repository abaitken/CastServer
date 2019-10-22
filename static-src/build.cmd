@echo off
pushd "%~dp0"
pushd ..
mkdir static
popd
npm run build 
popd
