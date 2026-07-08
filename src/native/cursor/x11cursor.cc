#include <node.h>
#include <v8.h>
#include <X11/Xlib.h>
#include <X11/Xcursor/Xcursor.h>
#include <string.h>

using namespace v8;

void CreateBlueCursor(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  
  if (args.Length() < 2 || !args[0]->IsNumber() || !args[1]->IsNumber()) {
    isolate->ThrowException(Exception::TypeError(
      String::NewFromUtf8(isolate, "Expected hotspotX, hotspotY").ToLocalChecked()));
    return;
  }
  
  int hotspotX = args[0]->Int32Value(isolate->GetCurrentContext()).FromJust();
  int hotspotY = args[1]->Int32Value(isolate->GetCurrentContext()).FromJust();
  
  Display* dpy = XOpenDisplay(NULL);
  if (!dpy) {
    isolate->ThrowException(Exception::Error(
      String::NewFromUtf8(isolate, "Cannot open X display").ToLocalChecked()));
    return;
  }
  
  int size = 32;
  XcursorImage* image = XcursorImageCreate(size, size);
  image->xhot = hotspotX;
  image->yhot = hotspotY;
  
  for (int y = 0; y < size; y++) {
    for (int x = 0; x < size; x++) {
      XcursorPixel* pixel = &image->pixels[y * size + x];
      int centerX = size / 2;
      int triangleTop = 4;
      int triangleBottom = 28;
      
      bool inside = false;
      if (y >= triangleTop && y <= triangleBottom) {
        float progress = (float)(y - triangleTop) / (triangleBottom - triangleTop);
        float halfWidth = progress * (size / 2 - 2);
        if (x >= centerX - halfWidth && x <= centerX + halfWidth) {
          inside = true;
        }
      }
      
      if (inside) {
        *pixel = 0xff3b82f6;
      } else {
        *pixel = 0x00000000;
      }
    }
  }
  
  Cursor cursor = XcursorImageLoadCursor(dpy, image);
  XcursorImageDestroy(image);
  
  Window root = DefaultRootWindow(dpy);
  XDefineCursor(dpy, root, cursor);
  XFlush(dpy);
  
  XCloseDisplay(dpy);
  
  args.GetReturnValue().Set(Boolean::New(isolate, true));
}

void ResetCursor(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  
  Display* dpy = XOpenDisplay(NULL);
  if (!dpy) {
    isolate->ThrowException(Exception::Error(
      String::NewFromUtf8(isolate, "Cannot open X display").ToLocalChecked()));
    return;
  }
  
  Window root = DefaultRootWindow(dpy);
  XUndefineCursor(dpy, root);
  XFlush(dpy);
  XCloseDisplay(dpy);
  
  args.GetReturnValue().Set(Boolean::New(isolate, true));
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "createBlueCursor", CreateBlueCursor);
  NODE_SET_METHOD(exports, "resetCursor", ResetCursor);
}

NODE_MODULE(x11cursor, Initialize)
