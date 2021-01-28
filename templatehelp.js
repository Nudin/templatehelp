
var createBar = function (id) {
  var cm = document.querySelector('.CodeMirror')
  var bar = document.createElement('div')
  var content = document.createElement('div')
  var close = document.createElement('div')
  close.innerText = 'x'
  close.style.position = 'absolute'
  close.style.right = '0.6em'
  close.style.top = '0.2em'
  close.style.fontSize = 'large'
  close.style.cursor = 'default'
  bar.append(close)
  close.onclick = disable
  bar.id = id
  bar.style.height = '99%'
  bar.style.width = '35%'
  bar.style.backgroundColor = '#EEE'
  bar.style.position = 'absolute'
  bar.style.top = 0
  bar.style.right = 0
  bar.style.padding = '0.7em'
  bar.style.overflow = 'scroll'
  cm.append(bar)
  bar.append(content)
  document.querySelector('.CodeMirror-scroll').style.width = '67%'
  return bar
}

var getBar = function () {
  var id = 'templatehelp'
  var bar = document.getElementById(id)
  if (bar === null) {
    bar = createBar(id)
  }
  bar.style.display = ''
  return bar.children[1]
}

var display = function (templatedata) {
  var bar = getBar()
  bar.innerHTML = ''
  var header = document.createElement('div')
  var name = document.createElement('h2')
  var desc = document.createElement('div')
  name.innerText = templatedata.title
  name.style.marginTop = '0.2em'
  desc.innerText = templatedata.description
  bar.append(header)
  header.append(name)
  header.append(desc)

  Object.entries(templatedata.params).forEach(function (arg) {
    var param = arg[0]
    var obj = arg[1]

    var div = document.createElement('div')
    bar.append(div)
    var header = document.createElement('h3')
    div.append(header)
    header.append(document.createTextNode(param))
    var desc = document.createElement('div')
    div.append(desc)
    desc.innerText = obj.description
  })
  bar.append(document.createElement('br'))
}

var showPreview = function (target) {
  var bar = getBar()
  bar.innerHTML += render(extractWikitext(target))
  bar.append(document.createElement('br'))
}

var render = function (wikitext) {
  var xmlhttp = new XMLHttpRequest()
  var url = window.location.origin + '/w/api.php?action=parse&format=json&contentmodel=wikitext&text=' + wikitext

  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var pages = JSON.parse(this.responseText).parse; console.log(this.responseText, pages)
      getBar().innerHTML += pages.text['*']
    }
  }
  xmlhttp.open('GET', url, true)
  xmlhttp.send()
}

var extractWikitext = function (elelemt) {
  /* basic implementation, doesn't support spaces, nested templates… */
  var line = elelemt.closest('span[role=presentation]').innerText
  var re = new RegExp('{{' + elelemt.innerText + '[^}]*}}')
  var match = line.match(re)
  if (match !== null) { return match[0] }
  return null
}

/*
var extractWikitext = function (elelemt) {
  var wikitext = ''
  var found = false
  var finished = false
  elelemt.closest('span[role=presentation]').childNodes.forEach(function (current) {
    if (finished) {
      return
    }
    if (current.classList.contains('cm-mw-template-bracket') && current.innerText === '{{') {
      wikitext = '{{'
    }
    if (current === elelemt) {
      found = true
    }
    if (found) {
      wikitext += current.innerText
    }
    if (found && current.innerText === '}}') {
      finished = true
    }
  })
  return wikitext
}
  */

var showHelp = function (templatename) {
  var xmlhttp = new XMLHttpRequest()
  var url = window.location.origin + '/w/api.php?action=templatedata&format=json&lang=de&titles=template%3A' + templatename

  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var pages = JSON.parse(this.responseText).pages
      if (Object.keys(pages).length === 0) {
        return
      }
      var page = pages[Object.keys(pages)[0]]
      display(page)
      finish()
    }
  }
  xmlhttp.open('GET', url, true)
  xmlhttp.send()
}

document.querySelector('.CodeMirror').onclick = function (e) {
  var target = e.target
  if (target.classList.contains('cm-mw-template-name')) {
    if (!enabled) return
    var templatename = target.innerText
    console.log(templatename)
    showHelp(templatename)
    showPreview(target)
  }
}

var enabled = false

var finish = function () {
  enabled = false
  document.querySelectorAll('.cm-mw-template-name').forEach(function (c) { c.style.cursor = '' })
}

var disable = function () {
  finish()
  var bar = document.getElementById('templatehelp')
  bar.style.display = 'none'
  document.querySelector('.CodeMirror-scroll').style.width = ''
}

var enable = function () {
  enabled = true
  document.querySelectorAll('.cm-mw-template-name').forEach(function (c) { c.style.cursor = 'help' })
}

$('#wpTextbox1').wikiEditor('addToToolbar', {
  section: 'main',
  group: 'codemirror',
  tools: {
    smile: {
      label: "What's that?", // or use labelMsg for a localized label, see above
      type: 'button',
      icon: '//upload.wikimedia.org/wikipedia/commons/1/1a/Contexthelp.png',
      action: {
        type: 'callback',
        execute: function () {
          enable()
        }
      }
    }
  }
})
