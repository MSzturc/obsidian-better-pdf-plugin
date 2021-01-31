import {Plugin, MarkdownRenderChild, App } from 'obsidian';
import * as pdfjs from 'pdfjs-dist/build/pdf.js';
import * as worker from 'pdfjs-dist/build/pdf.worker.entry.js';


interface PdfNodeParameters {
	url: string;
	page: number|Array<number>;
	scale: number;
	rotation: number;
	rect: Array<number>;
}

class PDFRenderNode extends MarkdownRenderChild {

	private canvas: HTMLCanvasElement;
	private app: App;
	private parameters: PdfNodeParameters;

	constructor(
		container: HTMLElement,
		app: App,
		parameters: PdfNodeParameters
  ) {
    super();
		this.containerEl = container;
		this.app = app;
		this.parameters = parameters;

		pdfjs.GlobalWorkerOptions.workerSrc = worker;
  }

  onload() {
		var el = this.containerEl;

		//Read & Validate Parameters
		var url = this.parameters.url;

		var pageNumbers = null;
		if(typeof this.parameters.page === 'number'){
			pageNumbers = [this.parameters.page];
		} else {
			pageNumbers = this.parameters.page;
		}

		if(pageNumbers === undefined) {
			pageNumbers = [1];
		}
		console.log(pageNumbers);

		var scale = this.parameters.scale;
		if(scale === undefined || scale < 0.1 || scale > 10.0) {
			scale = 1.0;
		}

		var rotation = this.parameters.rotation;
		if(rotation === undefined) {
			rotation = 0;
		}

		var rect = this.parameters.rect;
		if(rect === undefined) {
			rect = [0,0,0,0];
		}

		//Create Container for Pages
		var canvasContainer = this.containerEl.createDiv();
		canvasContainer.id = "pdf" + Math.floor(Math.random() * 10000000) + 1;

		//Read Filebuffer
		var fileStream = this.app.vault.adapter.readBinary(url)
		var vaultName = this.app.vault.getName();

		fileStream.then(function(buffer) {
			var loadingTask = pdfjs.getDocument(buffer);
			loadingTask.promise.then(function(pdfjs) {


				//Read pages
				for (let index = 0; index < pageNumbers.length; index++) {
					const pageNumber = pageNumbers[index];
					pdfjs.getPage(pageNumber).then(function(page) {
						
						var href = canvasContainer.createEl('a');
						href.href = url + '#page=' + pageNumber;
						href.className = "internal-link";

						var canvas = href.createEl('canvas');

						var offsetX = rect[0]*-1;
						var offsetY = rect[1]*-1;

						var viewport = page.getViewport({ scale: scale, rotation: rotation, offsetX: offsetX, offsetY: offsetY });
						var context = canvas.getContext('2d');
			
						if(rect[2] < 1){
							canvas.height = viewport.height;
							canvas.width = viewport.width;
						} else {
							canvas.height = rect[2];
							canvas.width = rect[3];
						}
						
						var renderContext = {
							canvasContext: context,
							viewport: viewport,
							renderInteractiveForms: true
						};
						page.render(renderContext);
					}).catch((error) => {
						el.createEl('h2', { text: error});
					});
				}

			});
		}).catch((error) => {
			el.createEl('h2', { text: error});
		});

  }

  onunload() {
  }
}

export default class MyPlugin extends Plugin {

	async onload() {
		console.log('Better PDF loading...');
		
		this.registerMarkdownPostProcessor(async (el, ctx) => {

			// Find PDF Node
			const nodes = el.querySelectorAll<HTMLPreElement>('pre[class*="language-pdf"]');
			if (!nodes) {
				return;
			}

			nodes.forEach(node => {

				// Get Parameters
				let parameters: PdfNodeParameters = null;
				try {
					parameters = JSON.parse(node.innerText);
					console.log(parameters);
				} catch (e) {
					console.log('Query was not valid JSON: ' + e.message);
				}

				//Remove old Representation
				const root = node.parentElement;
				root.removeChild(node);

				//Create PDF Node
				const child = new PDFRenderNode(root,app,parameters);
				ctx.addChild(child);
			});

		})

	}

	onunload() {
		console.log('unloading plugin');
	}
}