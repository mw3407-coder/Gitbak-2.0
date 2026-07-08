// Click-through: let mouse events pass to windows underneath
// BUT forward mouse move events so cursor can still track
win.setIgnoreMouseEvents(true, { forward: true });
