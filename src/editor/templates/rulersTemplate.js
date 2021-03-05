const rulersTemplate = document.createElement('template');

rulersTemplate.innerHTML = `
  <style>
 
  /* Rulers
——————————————————————————————————————*/

#rulers > div {
  position: absolute;
  background: var(--ruler-color);
  z-index: 1;
  overflow: hidden;
}

#ruler_corner {
  top: 41px;
  left: 41px;
  width: 15px;
  height: 15px;
}

#ruler_x {
  height: 15px;
  top: 41px;
  left: 56px;
  right: 30px;
  border-bottom: 1px solid;
  border-left: 1px solid #777;
}

#ruler_y {
  width: 15px;
  top: 55px;
  left: 41px;
  bottom: 41px;
  border-right: 1px solid;
  border-top: 1px solid #777;
}

#ruler_x canvas:first-child {
  margin-left: -16px;
}

#ruler_x canvas {
  float: left;
}

#ruler_y canvas {
  margin-top: -16px;
}

#ruler_x > div,
#ruler_y > div {
  overflow: hidden;
}
/*
@media screen and (max-width: 1250px) {
  #rulers #ruler_corner,
  #rulers #ruler_x {
    top: 71px;
  }
  
  #rulers #ruler_y {
    top: 57px;
  }
}
*/
  </style>
  <div id="rulers">
 <div id="ruler_corner"></div>
 <div id="ruler_x">
   <div>
     <canvas height="15"></canvas>
   </div>
 </div>
 <div id="ruler_y">
   <div>
     <canvas width="15"></canvas>
   </div>
 </div>
</div>
`;

export default rulersTemplate;
