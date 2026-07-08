{
  "targets": [{
    "target_name": "x11cursor",
    "sources": ["x11cursor.cc"],
    "include_dirs": [
      "<!@(pkg-config --cflags-only-I x11 xcursor libpng | sed 's/-I//g')"
    ],
    "libraries": [
      "<!@(pkg-config --libs x11 xcursor libpng)"
    ]
  }]
}
