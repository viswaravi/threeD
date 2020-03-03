import { Component, OnInit } from '@angular/core';
import ForceGraph3D from '3d-force-graph';
import { DatahelperService } from './datahelper.service';
import neoGraph from '../assets/data/records_R.json';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private dataHelper: DatahelperService) { }

  title = 'threeD';

  //NODE DATA VIS
  nodeDataVis = false;
  nodeProps = ['id', 'label', 'vx', 'vy', 'vz', 'color', 'x', 'y', 'z', 'size', '__threeObj', 'index', 'title'];
  dispNodeProps = [];
  dispNodeLabel = null;
  dispNodeID = null;
  isDispEdit = false;

  connectionMode = true;

  myGraph = null;


  nodeTypes = [];
  edgeTypes = [];


  dispNodes = [];
  dispEdges = [];

  GDATA = null;

  nodeSearchName = '';

  onResize(event) {
    // .width(event.target.innerWidth*.7)
    this.myGraph.height(event.target.innerHeight);
  }

  ngOnInit() {
    this.getNeoGraph();
  }


  getNeoGraph() {

    let gData = this.dataHelper.getSigmaGraph(neoGraph);

    console.log(gData.graph);


    /*
     LOAD GEPHI GRAPH DATA
      let gData = {'graph':{
         'nodes':[],
         'links':[]
       }};
       gData.graph.nodes = neoGraph.nodes;
       gData.graph.links = neoGraph.edges;
    
       
       console.log(gData);
    */

    this.myGraph = ForceGraph3D()
      (document.getElementById('3d-graph'))
      .width(window.innerWidth * .8)
      .height(window.innerHeight)
      .graphData(gData.graph)
      .linkDirectionalArrowLength(3.5)
      .linkDirectionalArrowRelPos(1)
      .linkCurvature(0)
      .nodeLabel('name')
      .linkThreeObjectExtend(true)
      .linkThreeObject(link => {
        // extend link with text sprite
        const sprite = new SpriteText(`${link.label}`);
        sprite.color = 'lightgrey';
        sprite.textHeight = 1.5;
        return sprite;
      })
      .linkPositionUpdate((sprite, { start, end }) => {

        var val = ['x', 'y', 'z'].map(c => ({ [c]: start[c] + (end[c] - start[c]) / 2 }));

        const middlePos = Object.assign({}, ...val);

        // console.log(middlePos);

        Object.assign(sprite.position, middlePos);

      })
      .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        this.myGraph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        )

        if (this.connectionMode) {

        }

      }
      )
      .onNodeHover(node => {

        if (node != null) {

          this.dispNodeProps = [];

          let props = Object.getOwnPropertyNames(node);
          props.forEach(prop => {

            this.nodeDataVis = true;
            //  console.log(prop);
            // console.log(node[prop]);

            if (!this.nodeProps.includes(prop)) {
              this.dispNodeProps.push({ key: prop, value: node[prop] });
            }

            this.dispNodeLabel = node['label'];
            this.dispNodeID = node['id'];

          });
        } else {
          console.log('NULL');
          //this.dispNodeProps = [];
          // this.nodeDataVis = false;
          //this.dispNodeLabel = null;
        }
      });;

    let { nodes, links } = this.myGraph.graphData();

    for (let i = 0; i < nodes.length; i++) {
      this.nodeTypes.push(nodes[i].name.toLowerCase());
    }

    for (let i = 0; i < links.length; i++) {
      if (!this.edgeTypes.includes(links[i].label.toLowerCase())) {
        this.edgeTypes.push(links[i].label.toLowerCase());
      }

    }

    this.dispNodes = [...this.nodeTypes];
    this.dispEdges = [...this.edgeTypes];

    this.GDATA = this.myGraph.graphData();


  }


  searchNode() {
    let { nodes, links } = this.myGraph.graphData();

    console.log('Searching :', this.nodeSearchName);

    let targetNode = null;

    for (let i = 0; i < nodes.length; i++) {

      if (this.nodeSearchName.toLowerCase() == nodes[i].name.toLowerCase()) {
        targetNode = nodes[i];
      }
    }

    if (targetNode != null) {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(targetNode.x, targetNode.y, targetNode.z);

      this.myGraph.cameraPosition(
        { x: targetNode.x * distRatio, y: targetNode.y * distRatio, z: targetNode.z * distRatio }, // new position
        targetNode, // lookAt ({ x, y, z })
        3000  // ms transition duration
      )
    }
  }

  edgeSelectionUpdate(event) {

    let edgeName = event.target.value.toLowerCase();

    console.log('Filtering Edge:', edgeName);

    let { nodes, links } = this.GDATA;

    if (this.dispEdges.includes(edgeName)) {
      this.dispEdges.splice(this.dispEdges.indexOf(edgeName), 1);
    } else {
      this.dispEdges.push(edgeName);
    }

    console.log(this.dispEdges);

    var updatedLinks = [];
    var updatedNodes = [];



    links.forEach(edge => {
      if (this.dispEdges.includes(edge.label.toLowerCase())) {
        updatedLinks.push(edge);

        if (!updatedNodes.includes(edge.source)) {
          updatedNodes.push(edge.source);
        }

        if (!updatedNodes.includes(edge.target)) {
          updatedNodes.push(edge.target);
        }
      }
    });

    console.log(updatedLinks.length);
    console.log(updatedNodes.length);

    /*
    links = links.filter(l => l.source !== node && l.target !== node); // Remove links attached to node
    nodes.splice(node.id, 1); // Remove node
    nodes.forEach((n, idx) => { n.id = idx; }); // Reset node ids to array index
    */

    this.myGraph.graphData({ nodes: updatedNodes, links: updatedLinks });

  }



  deleteNode() {
    console.log('Delete Node', this.dispNodeID);

    let { nodes, links } = this.GDATA;

    var updatedLinks = [];
    var updatedNodes = [];

    links.forEach(edge => {
      if (edge.source.id == this.dispNodeID || edge.target.id == this.dispNodeID) {
        console.log('Delete Edge', edge);
      } else {
        updatedLinks.push(edge);
      }
    });

    nodes.forEach(node => {
      if (node.id == this.dispNodeID) {
        console.log('Delete Node', node.id);
      } else {
        updatedNodes.push(node);
      }
    });

    // 
    // this.myGraph.graphData({ nodes: updatedNodes, links: updatedLinks });
    this.GDATA = { updatedNodes, updatedLinks };
    this.myGraph.graphData({ nodes: updatedNodes, links: updatedLinks });
    this.nodeDataVis = false;
  }

  editNode() {
    this.isDispEdit = true;
  }

  saveNodeEdit() {

    let { nodes, links } = this.GDATA;

    var updatedLinks = [];
    var updatedNodes = [];

    /*
    nodes.forEach(node => {
      if (node.id == this.dispNodeID) {

        this.dispNodeProps.forEach(prop => {
          let cname = '.' + String(prop.key);
          console.log('className', cname);
          const classArr: any = document.querySelectorAll(cname);
          classArr.forEach(element => {
            console.log('Saving', element.value);

            
            node[prop.key] = element.value;

          });
        });


        this.GDATA = { updatedNodes, updatedLinks };
        this.myGraph.graphData({ nodes: updatedNodes, links: updatedLinks });

      } else {
        updatedNodes.push(node);
      }
    });
    */

    this.isDispEdit = false;
  }

  discardNodeEdit() {
    this.isDispEdit = false;
  }
}
