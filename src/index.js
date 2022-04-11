import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
cytoscape.use(coseBilkent);

import './style.css';
// webpack으로 묶어줘야 하니 css파일을 진입점인 index.js 에 import 합니다

import './favicon.ico';
// favicon build
import '../model/data.json';
// data build

fetch('./model/data.json', { mode: 'no-cors' })
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        // 기존 코드
        const cy_for_rank = cytoscape({
            elements: data
        });
// rank를 활용하기 위해 data만 입력한 cytoscape 객체입니다

        const pageRank = cy_for_rank.elements().pageRank();
// elements들의 rank들입니다.

        const nodeMaxSize = 50;
        const nodeMinSize = 5;
        const nodeActiveSize = 28;
        const fontMaxSize = 8;
        const fontMinSize = 5;
        const fontActiveSize = 7;
// node & font 크기 값

        const edgeWidth = '2px';
        let edgeActiveWidth = '4px';
        const arrowScale = 0.8;
        const arrowActiveScale = 1.2;
// edge & arrow 크기값

        const dimColor = '#dfe4ea';
        const edgeColor = '#ced6e0';
        const nodeColor = '#57606f';
        const nodeActiveColor = '#ffa502';

        const successorColor = '#ff6348';
// 상위 node & edge color
        const predecessorsColor = '#1e90ff';
// 하위 node & edge color


// 아래는 공식 사이트에 올라와 있는 예제 코드입니다
        const cy = cytoscape({

            container: document.getElementById('cy'), // container to render in

            elements: data,

            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': nodeColor,
                        'label': 'data(label)',
                        'width': function (ele) {
                            return nodeMaxSize *  pageRank.rank('#' + ele.id())  + nodeMinSize;
                        },
                        'height': function (ele) {
                            return nodeMaxSize *  pageRank.rank('#' + ele.id()) + nodeMinSize;
                        },
                        'font-size': function (ele) {
                            return fontMaxSize *   pageRank.rank('#' + ele.id()) + fontMinSize;
                        },
                        'color': nodeColor
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        'width': edgeWidth,
                        'curve-style': 'bezier',
                        'line-color': edgeColor,
                        'target-arrow-color': edgeColor,
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': arrowScale
                    }
                }
            ],

            layout: {
                name: 'cose-bilkent',
                animate: false,
                gravityRangeCompound: 1.5,
                fit: true,
                tile: true
            }
        });

//이벤트 관련 함수
        function setDimStyle(target_cy, style) {
            target_cy.nodes().forEach(function (target) {
                target.style(style);
            });
            target_cy.edges().forEach(function (target) {
                target.style(style);
            });
        }

        function setFocus(target_element, successorColor, predecessorsColor, edgeWidth, arrowScale) {
            target_element.style('background-color', nodeActiveColor);
            target_element.style('color', nodeColor);
            target_element.successors().each(function (e) {
                    // 상위  엣지와 노드
                    if (e.isEdge()) {
                        e.style('width', edgeWidth);
                        e.style('arrow-scale', arrowScale);
                    }
                    e.style('color', nodeColor);
                    e.style('background-color', successorColor);
                    e.style('line-color', successorColor);
                    e.style('source-arrow-color', successorColor);
                    setOpacityElement(e, 0.5);
                }
            );
            target_element.predecessors().each(function (e) {
                // 하위 엣지와 노드
                if (e.isEdge()) {
                    e.style('width', edgeWidth);
                    e.style('arrow-scale', arrowScale);
                }
                e.style('color', nodeColor);
                e.style('background-color', predecessorsColor);
                e.style('line-color', predecessorsColor);
                e.style('source-arrow-color', predecessorsColor);
                setOpacityElement(e, 0.5);
            });
            target_element.neighborhood().each(function (e) {
                    // 이웃한 엣지와 노드
                    setOpacityElement(e, 1);
                }
            );
            target_element.style('width', Math.max(parseFloat(target_element.style('width')), nodeActiveSize));
            target_element.style('height', Math.max(parseFloat(target_element.style('height')), nodeActiveSize));
            target_element.style('font-size', Math.max(parseFloat(target_element.style('font-size')), fontActiveSize));
        }

        function setOpacityElement(target_element, degree) {
            target_element.style('opacity', degree);
        }

        function setResetFocus(target_cy) {
            target_cy.nodes().forEach(function (target) {
                target.style('background-color', nodeColor);
                var rank = pageRank.rank(target);
                target.style('width', nodeMaxSize * rank + nodeMinSize);
                target.style('height', nodeMaxSize * rank + nodeMinSize);
                target.style('font-size', fontMaxSize * rank + fontMinSize);
                target.style('color', nodeColor);
                target.style('opacity', 1);
            });
            target_cy.edges().forEach(function (target) {
                target.style('line-color', edgeColor);
                target.style('source-arrow-color', edgeColor);
                target.style('width', edgeWidth);
                target.style('arrow-scale', arrowScale);
                target.style('opacity', 1);
            });
        }

//클릭 이벤트 발생 시 url 연결
        cy.on('tap', function (e) {
            const url = e.target.data('url')
            if (url && url !== '') {
                window.open(url);
            }
        });

//마우스 인/아웃 시 하이라이트 적용/해제
        cy.on('tapstart mouseover', 'node', function (e) {
            setDimStyle(cy, {
                'background-color': dimColor,
                'line-color': dimColor,
                'source-arrow-color': dimColor,
                'color': dimColor
            });

            setFocus(e.target, successorColor, predecessorsColor, edgeActiveWidth, arrowActiveScale);
        });

        cy.on('tapend mouseout', 'node', function (e) {
            setResetFocus(e.cy);
        });

        let resizeTimer;

        window.addEventListener('resize', function () {
            this.clearTimeout(resizeTimer);
            resizeTimer = this.setTimeout(function(){
                cy.fit();
            },200);
        });
    });

