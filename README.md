## Obsidian Better PDF Plugin

Goal of this Plugin in to implement a native PDF handling workflow in Obsidian

### Features

- Insert a single PDF Page inside Note
- Insert a list or range of pages into Obsidian Note
- Hyperlink to PDF
- Scale the size of PDF Pages to fit Note layout
- Rotate PDF
- Cutout PDF Parts

### Demo

![Sample](https://github.com/MSzturc/obsidian-better-pdf-plugin/raw/master/sample/BetterPDF.gif)

### Syntax

|parameter|required|example|
|--|--|--|
|url  |yes  |**myPDF.pdf** or **subfolder/myPDF.pdf** or "[[MyFile.pdf]]"
|link|optional (default = false)| **true** or **false**
|page|optional (default = 1)| **1** or **[1, [3, 6], 8]** where **[3, 6]** is an inclusive range of pages. page = 0 is an alias for the whole document
|range|optional| **[1, 3]** Insert pages **1** to **3** (inclusive). Overwrites page.
|scale|optional (default = 1.0)| **0.5** for 50% size or **2.0** for 200% size
|fit|optional (default = true)| **true** or **false**
|rotation|optional (default = 0)| **90** for 90deg or **-90** -90deg or **180**
|rect|optional (default = \[0,0,0,0\])| offsetX, offsetY, sizeY, sizeX in Pixel


### Integration
- [JavaScript for Adobe Acrobat Pro and AppleScript for Skim for creating automatically the necessary Better PDF Plugin snippet](https://github.com/johnsidi/scripts-for-Obsidian-Better-PDF-Plugin)
