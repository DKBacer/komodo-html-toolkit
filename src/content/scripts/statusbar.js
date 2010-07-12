(function(){
  var $toolkit, _a, clearEncoding, clearEverything, clearIndentation, currentView, encodingSvc, encodingsBuilt, eventHandler, eventName, events, indentationBuilt, indentationsList, lastEncodingLongName, lastEncodingName, lastEncodingPythonName, lastEncodingUseBOM, lastIndentHardTabs, lastIndentLevels, lastIndentTabWidth, lastNewlineEndings, newlineEndings, pollingTimer, restartPolling, root, startPolling, stopPolling, stopPollingAndClear;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  root.extensions = root.extensions || {};
  $toolkit = root.extensions.htmlToolkit = root.extensions.htmlToolkit || {};
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  const POLLING_INTERVAL = 1000;
  encodingSvc = Cc['@activestate.com/koEncodingServices;1'].getService(Ci.koIEncodingServices);
  pollingTimer = null;
  newlineEndings = ['LF', 'CR', 'CRLF'];
  indentationBuilt = false;
  indentationsList = [2, 3, 4, 8];
  encodingsBuilt = false;
  lastEncodingName = null;
  lastEncodingLongName = null;
  lastEncodingPythonName = null;
  lastEncodingUseBOM = null;
  lastNewlineEndings = null;
  lastIndentHardTabs = null;
  lastIndentLevels = null;
  lastIndentTabWidth = null;
  clearEncoding = function() {
    var encodingWidget;
    encodingWidget = document.getElementById('statusbar-new-encoding-button');
    encodingWidget.removeAttribute('label');
    lastEncodingName = null;
    lastEncodingLongName = null;
    lastEncodingPythonName = null;
    lastEncodingUseBOM = null;
    lastNewlineEndings = null;
    return lastNewlineEndings;
  };
  clearIndentation = function() {
    var indentationWidget;
    indentationWidget = document.getElementById('statusbar-indentation-button');
    indentationWidget.removeAttribute('label');
    lastIndentHardTabs = null;
    lastIndentLevels = null;
    lastIndentTabWidth = null;
    return lastIndentTabWidth;
  };
  clearEverything = function() {
    clearEncoding();
    return clearIndentation();
  };
  startPolling = function(view) {
    var block, id;
    block = function() {
      var encodingButtonText, encodingWidget, indentationButtonText, indentationWidget, newEncodingLongName, newEncodingName, newEncodingPythonName, newEncodingUseBOM, newIndentHardTabs, newIndentLevels, newIndentTabWidth, newNewlineEndings;
      if (!(typeof view === "undefined" || view == undefined ? undefined : view.document)) {
        return clearEverything();
      }
      try {
        if (view.getAttribute('type') === 'startpage') {
          return clearEverything();
        } else {
          newEncodingName = view.document.encoding.short_encoding_name;
          newEncodingPythonName = view.document.encoding.python_encoding_name;
          newEncodingLongName = view.document.encoding.friendly_encoding_name;
          newEncodingUseBOM = view.document.encoding.use_byte_order_marker;
          newNewlineEndings = view.document.new_line_endings;
          if (lastEncodingName !== newEncodingName || lastEncodingPythonName !== newEncodingPythonName || lastEncodingLongName !== newEncodingLongName || lastEncodingUseBOM !== newEncodingUseBOM || lastNewlineEndings !== newNewlineEndings) {
            encodingButtonText = newEncodingName;
            if (newEncodingUseBOM) {
              encodingButtonText += '+BOM';
            }
            encodingButtonText += (": " + (newlineEndings[newNewlineEndings]));
            encodingWidget = document.getElementById('statusbar-new-encoding-button');
            encodingWidget.setAttribute('label', encodingButtonText);
            lastEncodingName = newEncodingName;
            lastEncodingPythonName = newEncodingPythonName;
            lastEncodingLongName = newEncodingLongName;
            lastEncodingUseBOM = newEncodingUseBOM;
            lastNewlineEndings = newNewlineEndings;
          }
          if (view.scimoz) {
            newIndentHardTabs = view.scimoz.useTabs;
            newIndentLevels = view.scimoz.indent;
            newIndentTabWidth = view.scimoz.tabWidth;
            if (lastIndentHardTabs !== newIndentHardTabs || lastIndentLevels !== newIndentLevels || lastIndentTabWidth !== newIndentTabWidth) {
              indentationButtonText = ("" + (newIndentHardTabs ? 'Tabs' : 'Soft Tabs') + ": ");
              indentationButtonText += newIndentLevels;
              if (newIndentLevels !== newIndentTabWidth) {
                indentationButtonText += (" [" + newIndentTabWidth + "]");
              }
              indentationWidget = document.getElementById('statusbar-indentation-button');
              indentationWidget.setAttribute('label', indentationButtonText);
              lastIndentHardTabs = newIndentHardTabs;
              lastIndentLevels = newIndentLevels;
              lastIndentTabWidth = newIndentTabWidth;
              return lastIndentTabWidth;
            }
          } else {
            return clearIndentation();
          }
        }
      } catch (e) {
        return clearEverything();
      }
    };
    block();
    pollingTimer = setInterval(block, POLLING_INTERVAL);
    id = pollingTimer;
    return id;
  };
  stopPolling = function() {
    if (!(pollingTimer)) {
      return null;
    }
    clearInterval(pollingTimer);
    pollingTimer = null;
    return pollingTimer;
  };
  stopPollingAndClear = function() {
    stopPolling();
    return clearEverything();
  };
  restartPolling = function(event) {
    if (ko.views.manager.batchMode) {
      return null;
    }
    stopPolling();
    return startPolling(event.originalTarget);
  };
  events = {
    'current_view_changed': restartPolling,
    'view_closed': stopPollingAndClear
  };
  currentView = function() {
    var view;
    view = ko.views.manager == undefined ? undefined : ko.views.manager.currentView;
    return view && view.getAttribute('type') === 'editor' && view.document && view.scimoz ? view : false;
  };
  _a = events;
  for (eventName in _a) { if (__hasProp.call(_a, eventName)) {
    eventHandler = _a[eventName];
    root.addEventListener(eventName, eventHandler, true);
  }}
  ko.main.addWillCloseHandler(function() {
    var _b, _c;
    _b = []; _c = events;
    for (eventName in _c) { if (__hasProp.call(_c, eventName)) {
      eventHandler = _c[eventName];
      _b.push(root.removeEventListener(eventName, eventHandler, true));
    }}
    return _b;
  });
  $toolkit.statusbar = $toolkit.statusbar || {};
  $toolkit.statusbar.updateViewLineEndings = function(mode) {
    var view;
    if (lastNewlineEndings === mode) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.document.new_line_endings = mode;
    view.document.prefs.setStringPref('endOfLine', newlineEndings[mode]);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateViewExistingEndings = function() {
    var view;
    if (!(view = currentView())) {
      return null;
    }
    view.document.existing_line_endings = lastNewlineEndings;
    return view.document.existing_line_endings;
  };
  $toolkit.statusbar.updateViewIndentation = function(levels) {
    var view;
    if (levels === lastIndentLevels) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.scimoz.tabWidth = (view.scimoz.indent = levels);
    view.document.prefs.setLongPref('indentWidth', levels);
    view.document.prefs.setLongPref('tabWidth', levels);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateViewHardTabs = function(useTabs) {
    var view;
    if (useTabs === lastIndentHardTabs) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.scimoz.useTabs = useTabs;
    view.document.prefs.setBooleanPref('useTabs', useTabs);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateLineEndingsMenu = function() {
    var _b, _c, convertEl, index, itemsList, lineEndingsMenu, type;
    lineEndingsMenu = document.getElementById('statusbar-line-endings-menu');
    itemsList = {
      LF: document.getElementById('contextmenu_lineEndingsUnix'),
      CR: document.getElementById('contextmenu_lineEndingsMac'),
      CRLF: document.getElementById('contextmenu_lineEndingsDOSWindows')
    };
    _b = newlineEndings;
    for (index = 0, _c = _b.length; index < _c; index++) {
      type = _b[index];
      if (typeof lastNewlineEndings !== "undefined" && lastNewlineEndings !== null) {
        itemsList[type].removeAttribute('disabled');
        itemsList[type].setAttribute('checked', lastNewlineEndings === index ? true : false);
      } else {
        itemsList[type].setAttribute('disabled', true);
        itemsList[type].setAttribute('checked', false);
      }
    }
    convertEl = document.getElementById('contextmenu_lineEndingsConvertExisting');
    return (typeof lastNewlineEndings !== "undefined" && lastNewlineEndings !== null) ? convertEl.removeAttribute('disabled') : convertEl.setAttribute('disabled', true);
  };
  $toolkit.statusbar.updateEncodingsMenu = function() {
    var encodingsMenu, index, itemEl, popupEl, updateChecked, updateClass, updateDisabled;
    encodingsMenu = document.getElementById('statusbar-encodings-menu');
    if (!(encodingsBuilt)) {
      popupEl = ko.widgets.getEncodingPopup(encodingSvc.encoding_hierarchy, true, 'alert("TODO: " + this)');
      updateClass = function(node) {
        var _b, _c, _d, _e, _f, child;
        node.setAttribute('class', 'statusbar-label');
        if ((typeof (_b = node.getAttribute('data')) !== "undefined" && _b !== null)) {
          node.setAttribute('type', 'checkbox');
        }
        if (node.childNodes.length) {
          _c = []; _e = node.childNodes;
          for (_d = 0, _f = _e.length; _d < _f; _d++) {
            child = _e[_d];
            _c.push(updateClass(child));
          }
          return _c;
        }
      };
      updateClass(popupEl);
      while (popupEl.childNodes.length) {
        encodingsMenu.appendChild(popupEl.firstChild);
      }
      encodingsBuilt = true;
    }
    if (typeof lastEncodingPythonName !== "undefined" && lastEncodingPythonName !== null) {
      index = encodingSvc.get_encoding_index(lastEncodingPythonName);
    }
    if (index < 0) {
      itemEl = document.createElementNS(XUL_NS, 'menuitem');
      itemEl.setAttribute('data', lastEncodingPythonName);
      itemEl.setAttribute('label', lastEncodingLongName);
      itemEl.setAttribute('oncommand', 'alert("TODO: " + this)');
      encodingsMenu.insertBefore(itemEl, encodingsMenu.firstChild);
    }
    updateChecked = function(node) {
      var _b, _c, _d, _e, _f, child, pythonName;
      node.removeAttribute('disabled');
      (typeof (_b = (pythonName = node.getAttribute('data'))) !== "undefined" && _b !== null) ? node.setAttribute('checked', pythonName === lastEncodingPythonName ? true : false) : null;
      if (node.childNodes.length) {
        _c = []; _e = node.childNodes;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          child = _e[_d];
          _c.push(updateChecked(child));
        }
        return _c;
      }
    };
    updateDisabled = function(node) {
      var _b, _c, _d, _e, _f, child, pythonName;
      if (!node.childNodes.length) {
        node.setAttribute('disabled', true);
      }
      (typeof (_b = (pythonName = node.getAttribute('data'))) !== "undefined" && _b !== null) ? node.setAttribute('checked', false) : null;
      if (node.childNodes.length) {
        _c = []; _e = node.childNodes;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          child = _e[_d];
          _c.push(updateDisabled(child));
        }
        return _c;
      }
    };
    return (typeof lastEncodingPythonName !== "undefined" && lastEncodingPythonName !== null) ? updateChecked(encodingsMenu) : updateDisabled(encodingsMenu);
  };
  $toolkit.statusbar.updateIndentationMenu = function() {
    var _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, firstChild, inList, indentationMenu, itemEl, levels, otherLevelEl, softTabsEl;
    indentationMenu = document.getElementById('statusbar-indentation-menu');
    if (!(indentationBuilt)) {
      firstChild = indentationMenu.firstChild;
      _c = indentationsList;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        (function() {
          var itemEl;
          var levels = _c[_b];
          itemEl = document.createElementNS(XUL_NS, 'menuitem');
          itemEl.setAttribute('class', 'statusbar-label');
          itemEl.setAttribute('id', ("contextmenu_indentation" + levels));
          itemEl.setAttribute('name', 'current_indentation');
          itemEl.setAttribute('label', levels);
          itemEl.setAttribute('accesskey', levels);
          itemEl.setAttribute('type', 'checkbox');
          itemEl.setAttribute('data-indent', levels);
          itemEl.addEventListener('command', function() {
            return $toolkit.statusbar.updateViewIndentation(levels);
          }, null);
          return indentationMenu.insertBefore(itemEl, firstChild);
        })();
      }
      indentationBuilt = true;
    }
    if (typeof lastIndentLevels !== "undefined" && lastIndentLevels !== null) {
      inList = false;
      _f = indentationMenu.childNodes;
      for (_e = 0, _g = _f.length; _e < _g; _e++) {
        itemEl = _f[_e];
        itemEl.removeAttribute('disabled');
        if ((typeof (_h = (levels = itemEl.getAttribute('data-indent'))) !== "undefined" && _h !== null)) {
          itemEl.setAttribute('checked', Number(levels) === lastIndentLevels ? (inList = true) : false);
        }
      }
      otherLevelEl = document.getElementById('contextmenu_indentationOther');
      otherLevelEl.setAttribute('checked', inList ? false : true);
      softTabsEl = document.getElementById('contextmenu_indentationSoftTabs');
      return softTabsEl.setAttribute('checked', lastIndentHardTabs ? false : true);
    } else {
      _i = []; _k = indentationMenu.childNodes;
      for (_j = 0, _l = _k.length; _j < _l; _j++) {
        itemEl = _k[_j];
        _i.push((function() {
          itemEl.setAttribute('disabled', true);
          return itemEl.setAttribute('checked', false);
        })());
      }
      return _i;
    }
  };
  $toolkit.statusbar.showCustomIndentationPanel = function() {
    var panelEl, relativeEl, scaleEl, view;
    if (!(view = currentView())) {
      return null;
    }
    scaleEl = document.getElementById('customIndentation_scale');
    scaleEl.setAttribute('value', lastIndentLevels);
    panelEl = document.getElementById('customIndentation_panel');
    relativeEl = document.getElementById('statusbarviewbox');
    return panelEl.openPopup(relativeEl, 'before_end', -document.getElementById('statusbar-language').boxObject.width - 10, 0);
  };
  $toolkit.statusbar.handleCustomIndentationPanelKey = function(event) {
    var _b, panelEl, scaleEl;
    if (!((event.DOM_VK_ENTER === (_b = event.keyCode) || event.DOM_VK_RETURN === _b))) {
      return null;
    }
    event.preventDefault();
    event.stopPropagation();
    scaleEl = document.getElementById('customIndentation_scale');
    panelEl = document.getElementById('customIndentation_panel');
    panelEl.hidePopup();
    return $toolkit.statusbar.updateViewIndentation(Number(scaleEl.getAttribute('value')));
  };
  $toolkit.statusbar.updateSoftTabs = function() {
    var softTabsEl;
    softTabsEl = document.getElementById('contextmenu_indentationSoftTabs');
    return $toolkit.statusbar.updateViewHardTabs(softTabsEl.getAttribute('checked') !== 'true');
  };
})();
