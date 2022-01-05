import { Plugin, MarkdownRenderChild, App } from "obsidian";
import * as pdfjs from "pdfjs-dist/build/pdf.js";
import * as worker from "pdfjs-dist/build/pdf.worker.entry.js";

interface PdfNodeParameters {
  url: string;
  page: number | Array<number>;
  scale: number;
  fit: boolean,
  rotation: number;
  rect: Array<number>;
}

export default class BetterPDFPlugin extends Plugin {
  async onload() {
    console.log("Better PDF loading...");

    pdfjs.GlobalWorkerOptions.workerSrc = worker;

    this.registerMarkdownCodeBlockProcessor("pdf", async (src, el, ctx) => {

      // Get Parameters
      let parameters: PdfNodeParameters = null;
      try {
        parameters = this.readParameters(src);
      } catch (e) {
        el.createEl("h2", { text: "PDF Parameters invalid: " + e.message });
      }

      //Create PDF Node
      if (parameters !== null) {
        try {

          //Read Document
          var vaultName = this.app.vault.getName();
          var buffer = await this.app.vault.adapter.readBinary(parameters.url);
          var document = await pdfjs.getDocument(buffer).promise;

          //Read pages
          for (let pageNumber of <number[]>parameters.page) {
            var page = await document.getPage(pageNumber);

            // Create hyperlink for Page
            var href = el.createEl("a");
            href.href = parameters.url + "#page=" + pageNumber;
            href.className = "internal-link";

            // Get Viewport
            var offsetX = Math.floor(
              parameters.rect[0] * -1 * parameters.scale
            );
            var offsetY = Math.floor(
              parameters.rect[1] * -1 * parameters.scale
            );

            var viewport = page.getViewport({
              scale: parameters.scale,
              rotation: parameters.rotation,
              offsetX: offsetX,
              offsetY: offsetY,
            });

            // Render Canvas
            var canvas = href.createEl("canvas");
            if (parameters.fit) {
              canvas.style.width = "100%";
            }

            var context = canvas.getContext("2d");

            if (parameters.rect[2] < 1) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
            } else {
              canvas.height = Math.floor(parameters.rect[2] * parameters.scale);
              canvas.width = Math.floor(parameters.rect[3] * parameters.scale);
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
    });
  }

  private readParameters(jsonString: any) {
    // "url" : [[file.pdf]] is an invalid json since it misses quotation marks in value
    if (jsonString.contains("[[") && !jsonString.contains('"[[')) {
      jsonString = jsonString.replace("[[", '"[[');
      jsonString = jsonString.replace("]]", ']]"');
    }

    let parameters: PdfNodeParameters = JSON.parse(jsonString);

    //Transform internal Link to external
    if (parameters.url.startsWith("[[")) {
      parameters.url = parameters.url.substr(2, parameters.url.length - 4);
      parameters.url = this.app.metadataCache.getFirstLinkpathDest(
        parameters.url,
        ""
      ).path;
    }

    //Convert Range (if present) and Page to Array<Page>
    if (parameters.range !== undefined) {
          parameters.page = Array.from({ length: parameters.range[1] - parameters.range[0] + 1 }, (_, i) => parameters.range[0] + i);
    }
    if (typeof parameters.page === "number") {
      parameters.page = [parameters.page];
    }
    if (parameters.page === undefined) {
      parameters.page = [1];
    }

    if (
      parameters.scale === undefined ||
      parameters.scale < 0.1 ||
      parameters.scale > 10.0
    ) {
      parameters.scale = 1.0;
    }

    if (parameters.fit === undefined) {
      parameters.fit = true;
    }

    if (parameters.rotation === undefined) {
      parameters.rotation = 0;
    }

    if (parameters.rect === undefined) {
      parameters.rect = [0, 0, 0, 0];
    }
    return parameters;
  }

  onunload() {
    console.log("unloading Better PDF plugin...");
  }
}
