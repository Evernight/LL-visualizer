var labelType, useGradients, nativeTextSupport, animate;

(function() {
	var ua = navigator.userAgent,
	iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
	typeOfCanvas = typeof HTMLCanvasElement,
	nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
	textSupport = nativeCanvasSupport
	&& (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
	//I'm setting this based on the fact that ExCanvas provides text support for IE
	//and that as of today iPhone/iPad current text support is lame
	labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
	nativeTextSupport = labelType == 'Native';
	useGradients = nativeCanvasSupport;
	animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
	elem: false,
	write: function(text){
		if (!this.elem)
			this.elem = document.getElementById('log');
		this.elem.innerHTML = text;
	//this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
	}
};

function init_tree() {
	var json = {
		id: "node0",
		name: "Дерево разбора",
		data: {},
		children: [{
			id: "node1",
			name: "L",
			data: {},
			children: [{
				id: "node3",
				name: "LL"
			}, {
				id: "node4",
				name: "LR"
			}]
		}, {
			id: "node2",
			name: "R"
		}]
	};

	var st = new $jit.ST({
		injectInto: 'tree',
		duration: 400,
		transition: $jit.Trans.Quart.easeInOut,
		levelDistance: 40,
		Navigation: {
			enable:true,
			panning:false
		},
		orientation: "top",

		Node: {
			height: 20,
			width: 120,
			type: 'rectangle',
			color: '#F4A460',

			overridable: true
		},
        
		Edge: {
			type: 'bezier',
			color: '#111111',
			overridable: true
		},
        
		onCreateLabel: function(label, node){
			label.id = node.id;
			label.innerHTML = node.name;
			/*label.onclick = function() {
				if(normal.checked) {
					st.onClick(node.id);
				} else {
					st.setRoot(node.id, 'animate');
				}
			};*/
			//set label styles
			var style = label.style;
			style.width = this.Node.width + 'px';
			style.height = this.Node.height + 'px';
			style.cursor = 'pointer';
			style.color = '#333';
			style.fontSize = '0.8em';
			style.textAlign= 'center';
			style.paddingTop = '3px';
		}

	});
	//load json data
	st.loadJSON(json);
	//compute node positions and layout
	st.compute();
	//emulate a click on the root node.
	st.onClick(st.root, {
		Move: {
			offsetY: 100
		}
	});
}
