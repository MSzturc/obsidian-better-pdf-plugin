## Obsidian Better PDF Plugin

Goal of this Plugin in to implement a native PDF handling workflow in Obsidian

### Features

- Insert a single PDF Page inside Note
- Insert a List of Pages into Obsidian Note
- Hyperlink to PDF
- Scale the size of PDF Pages to fit Note layout
- Rotate PDF
- Cutout PDF Parts

### Synthax

|parameter|required|example|
|--|--|--|
|url  |yes  |**myPDF.pdf** or **subfolder/myPDF.pdf** 
|page|optional (default = 1)| **1** or **[1,6,7,8]**
|scale|optional (default = 1.0)| **0.5** for 50% size or **2.0** for 200% size
|rotation|optional (default = 0)| **90** for 90deg or **-90** -90deg or **180**
|rect|optional (default = \[0,0,0,0\])| offsetX, offsetY, sizeX, sizeX in Pixel

### Sample


![Sample](sample/Sample_Render.png)


![Sample](sample/Sample_Editor.png)

