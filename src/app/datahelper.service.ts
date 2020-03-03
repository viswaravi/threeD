import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatahelperService {

  constructor() { }

  colors = ['#009e73', '#ff0000'];
  nodeTypes = [];
  edgeTypes = [];

  graph = { nodes: [], links: [] };
  nodeID = [];
  edgeID = [];

  getSigmaGraph(neoRecords) {

    this.graph = { nodes: [], links: [] };

    neoRecords.forEach(record => {
      this.toSigmaNode(record.n);
      this.toSigmaNode(record.m);
      this.toSigmaEdge(record.r);
    });

    return {
      'graph': this.graph,
      'nodeTypes': this.nodeTypes,
      'edgeTypes': this.edgeTypes
    };
  }

  toSigmaNode(record) {
    if (!this.nodeID.includes(record.identity)) {

      this.nodeID.push(record.identity);

      let node = new Object();

      node['id'] = record.identity.toString();
      node['label'] = record.labels[0];


      // Add Color
      let nodeType = record.labels[0];
      if (!this.nodeTypes.includes(nodeType)) {
        this.nodeTypes.push(nodeType);
      }
      node['color'] = this.colors[this.nodeTypes.indexOf(nodeType)];


      /*
      // Add Attrbutes
      let props = Object.getOwnPropertyNames(record.properties);
      node['attributes'] = {};
      props.forEach(prop => {
        node['attributes'][prop] = record.properties[prop];
      });
      */

      let props = Object.getOwnPropertyNames(record.properties);
      props.forEach(prop => {
        node[prop] = record.properties[prop];
      });


      //Customization to get Movie title as Node Names
      if (node['label'] == 'Movie') {
        node['name'] = record.properties['title'];
      }


      // Add Random Position
      let min = 1, max = 3;

      node['x'] = Math.random() * (max - min) + min;
      node['y'] = Math.random() * (max - min) + min;

      node['size'] = 1;

      this.graph.nodes.push(node);

    }

  }


  toSigmaEdge(record) {
    if (!this.edgeID.includes(record.identity)) {

      this.edgeID.push(record.identity);

      let edge = new Object();

      edge['id'] = record.identity.toString();
      edge['source'] = record.start.toString();
      edge['target'] = record.end.toString();

      //Add Default Styling
      edge['type'] = 'line';
      edge['size'] = 1;
      edge['color'] = '#a9a9a9';


      let edgeType = record.type;
      edge['label'] = edgeType;

      if (!this.edgeTypes.includes(edgeType)) {
        this.edgeTypes.push(edgeType);
      }

      // Add Attrbutes
      let props = Object.getOwnPropertyNames(record.properties);
      edge['attributes'] = {};
      props.forEach(prop => {
        edge['attributes'][prop] = record.properties[prop];
      });


      this.graph.links.push(edge);

    }
  }
}
