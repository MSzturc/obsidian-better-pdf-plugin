import { Plugin, MarkdownRenderChild, App } from "obsidian";
import * as pdfjs from "pdfjs-dist/build/pdf.js";
import * as worker from "pdfjs-dist/build/pdf.worker.entry.js";

interface PdfNodeParameters {
  url: string;
  page: number | Array<number>;
  scale: number;
  rotation: number;
  rect: Array<number>;
}

export default class MyPlugin extends Plugin {
  async onload() {
    console.log("Better PDF loading...");

    pdfjs.GlobalWorkerOptions.workerSrc = worker;

    this.registerMarkdownPostProcessor(async (el, ctx) => {
      // Find PDF Node
      const nodes = el.querySelectorAll<HTMLPreElement>(
        'pre[class*="language-pdf"]'
      );
      if (!nodes) {
        return;
      }

      for (let node of nodes) {
        // Get Parameters
        let parameters: PdfNodeParameters = null;
        try {
          var rawText = node.innerText;

          // "url" : [[file.pdf]] is an invalid json since it misses quotation marks in value
          if (rawText.contains("[[") && !rawText.contains('"[[')) {
            rawText = rawText.replace("[[", '"[[');
            rawText = rawText.replace("]]", ']]"');
          }
          parameters = JSON.parse(rawText);
        } catch (e) {
          el.createEl("h2", { text: "PDF Parameters invalid: " + e.message });
        }

        //Remove old Representation
        const root = node.parentElement;
        root.removeChild(node);

        //Create PDF Node
        if (parameters !== null) {
          try {
            //Read & Validate Parameters
            var url = parameters.url;
            if (url.startsWith("[[")) {
              url = url.substr(2, url.length - 4);
              url = this.app.metadataCache.getFirstLinkpathDest(url, "").path;
            }

            var pageNumbers = null;
            if (typeof parameters.page === "number") {
              pageNumbers = [parameters.page];
            } else {
              pageNumbers = parameters.page;
            }

            if (pageNumbers === undefined) {
              pageNumbers = [1];
            }

            var scale = parameters.scale;
            if (scale === undefined || scale < 0.1 || scale > 10.0) {
              scale = 1.0;
            }

            var rotation = parameters.rotation;
            if (rotation === undefined) {
              rotation = 0;
            }

            var rect = parameters.rect;
            if (rect === undefined) {
              rect = [0, 0, 0, 0];
            }

            //Create Container for Pages
            var canvasContainer = el.createDiv();
            canvasContainer.id =
              "pdf" + Math.floor(Math.random() * 10000000) + 1;

            //Read Document
            var vaultName = this.app.vault.getName();
            var buffer = await this.app.vault.adapter.readBinary(url);
            var document = await pdfjs.getDocument(buffer).promise;

            //Read pages
            for (let pageNumber of pageNumbers) {
              var page = await document.getPage(pageNumber);

              // Create hyperlink for Page
              var href = canvasContainer.createEl("a");
              href.href = url + "#page=" + pageNumber;
              href.className = "internal-link";

              // Get Viewport
              var offsetX = Math.floor(rect[0] * -1 * scale);
              var offsetY = Math.floor(rect[1] * -1 * scale);

              var viewport = page.getViewport({
                scale: scale,
                rotation: rotation,
                offsetX: offsetX,
                offsetY: offsetY,
              });

              // Render Canvas
              var canvas = href.createEl("canvas");
              var context = canvas.getContext("2d");

              if (rect[2] < 1) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
              } else {
                canvas.height = Math.floor(rect[2] * scale);
                canvas.width = Math.floor(rect[3] * scale);
              }

              var renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              await page.render(renderContext);
            }
          } catch (error) {
            el.createEl("h2", { text: error });
          }
        }
      }
    });
  }

  onunload() {
    console.log("unloading Better PDF plugin...");
  }
}
