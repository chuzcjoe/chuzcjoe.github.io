---
title: Photo Editor
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: null
    collapsed: true
    depth: 3
  - position: left
    type: adsense
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-03-15 21:37:00
tags: [editor]
categories:
- tool
---

A web-based photo editor. Suppport adding text, rectangle and arrow.

<!-- more -->

## Web-based Image Editor

This is a simple web-based image editor that allows you to:
1. Add text with adjustable color and size
2. Add rectangles with adjustable color and size
3. Add arrows with adjustable color and size

<div id="editor-container" style="margin-top: 20px;">
  <div id="toolbar" style="margin-bottom: 15px; background-color: #f7f7f7; border-radius: 10px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div class="button-group">
      <button id="upload-btn" class="ios-btn" title="Upload Image">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <span>Upload</span>
      </button>
      <input type="file" id="upload-input" accept="image/*" style="display: none;">
      <button id="text-btn" class="ios-btn" title="Add Text">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
        <span>Text</span>
      </button>
      <button id="rect-btn" class="ios-btn" title="Add Rectangle">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        <span>Rectangle</span>
      </button>
      <button id="arrow-btn" class="ios-btn" title="Add Arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        <span>Arrow</span>
      </button>
      <button id="delete-btn" class="ios-btn ios-btn-danger" title="Delete Selected">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        <span>Delete</span>
      </button>
      <button id="download-btn" class="ios-btn ios-btn-primary" title="Download Image">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Download</span>
      </button>
    </div>
    <div class="control-group" style="margin-top: 15px; display: flex; align-items: center;">
      <div class="color-control" style="display: flex; align-items: center; margin-right: 20px;">
        <label for="color-picker" style="margin-right: 8px; font-size: 14px; color: #555;">Color:</label>
        <div class="color-preview" style="position: relative; width: 30px; height: 30px; border-radius: 50%; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
          <input type="color" id="color-picker" value="#000000" style="position: absolute; width: 150%; height: 150%; top: -25%; left: -25%; cursor: pointer;">
        </div>
      </div>
      <div class="size-control" style="flex-grow: 1; display: flex; align-items: center;">
        <label for="size-slider" style="margin-right: 8px; font-size: 14px; color: #555;">Size:</label>
        <input type="range" id="size-slider" min="1" max="50" value="10" style="flex-grow: 1; height: 6px; -webkit-appearance: none; background: #e0e0e0; border-radius: 3px; outline: none;">
      </div>
    </div>
  </div>
  <div id="canvas-container" style="border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <canvas id="main-canvas" width="800" height="600" style="display: block;"></canvas>
  </div>
</div>

<style>
#editor-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 850px;
  margin: 0 auto;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ios-btn {
  background-color: #ffffff;
  border: none;
  color: #007aff;
  padding: 8px 12px;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  min-width: 80px;
  flex-direction: column;
  gap: 5px;
}

.ios-btn svg {
  margin-bottom: 2px;
}

.ios-btn:hover {
  background-color: #f0f0f0;
}

.ios-btn.active {
  background-color: #e6f2ff;
  box-shadow: 0 0 0 2px #007aff40;
}

.ios-btn-primary {
  background-color: #007aff;
  color: white;
}

.ios-btn-primary:hover {
  background-color: #0069d9;
}

.ios-btn-danger {
  color: #ff3b30;
}

.ios-btn-danger:hover {
  background-color: #fff0f0;
}

#canvas-container {
  background-color: #f8f8f8;
  overflow: hidden;
}

#main-canvas {
  background-color: white;
}

/* Custom range slider styling */
input[type=range] {
  -webkit-appearance: none;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

input[type=range]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border: none;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadInput = document.getElementById('upload-input');
  const textBtn = document.getElementById('text-btn');
  const rectBtn = document.getElementById('rect-btn');
  const arrowBtn = document.getElementById('arrow-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const downloadBtn = document.getElementById('download-btn');
  const colorPicker = document.getElementById('color-picker');
  const sizeSlider = document.getElementById('size-slider');

  // Update color preview when color changes
  colorPicker.addEventListener('input', function() {
    this.parentElement.style.backgroundColor = this.value;
  });
  // Set initial color
  colorPicker.parentElement.style.backgroundColor = colorPicker.value;

  let backgroundImage = null;
  let objects = [];
  let selectedObject = null;
  let isDragging = false;
  let isResizing = false;
  let resizeHandle = null;
  let startX, startY;
  let currentTool = null;
  let isDrawing = false;
  let tempObject = null;
  const handleSize = 8; // Size of resize handles

  // Initialize canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Function to reset tool buttons visual state
  function resetToolButtons() {
    textBtn.classList.remove('active');
    rectBtn.classList.remove('active');
    arrowBtn.classList.remove('active');
    currentTool = null;
  }

  // Upload image functionality
  uploadBtn.addEventListener('click', function() {
    uploadInput.click();
  });

  uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          // Resize canvas to fit image
          const aspectRatio = img.width / img.height;
          if (img.width > 800) {
            canvas.width = 800;
            canvas.height = 800 / aspectRatio;
          } else if (img.height > 600) {
            canvas.height = 600;
            canvas.width = 600 * aspectRatio;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          
          backgroundImage = img;
          redraw();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Tool selection
  textBtn.addEventListener('click', function() {
    resetToolButtons();
    currentTool = 'text';
    textBtn.classList.add('active');
  });

  rectBtn.addEventListener('click', function() {
    resetToolButtons();
    currentTool = 'rect';
    rectBtn.classList.add('active');
  });

  arrowBtn.addEventListener('click', function() {
    resetToolButtons();
    currentTool = 'arrow';
    arrowBtn.classList.add('active');
  });

  deleteBtn.addEventListener('click', function() {
    if (selectedObject) {
      const index = objects.indexOf(selectedObject);
      if (index > -1) {
        objects.splice(index, 1);
        selectedObject = null;
        redraw();
      }
    }
  });

  downloadBtn.addEventListener('click', function() {
    // Temporarily remove selection highlight
    const tempSelected = selectedObject;
    selectedObject = null;
    redraw();
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Restore selection
    selectedObject = tempSelected;
    redraw();
  });

  // Get resize handles for an object
  function getResizeHandles(obj) {
    const handles = [];
    
    if (obj.type === 'text') {
      const width = obj.width || ctx.measureText(obj.text).width;
      const height = obj.height || obj.size;
      
      // Bottom right corner
      handles.push({
        x: obj.x + width,
        y: obj.y + height,
        cursor: 'nwse-resize',
        action: function(dx, dy) {
          obj.size = Math.max(10, obj.size + dy / 2);
          obj.width = Math.max(20, width + dx);
          obj.height = Math.max(10, height + dy);
        }
      });
    } else if (obj.type === 'rect') {
      // Bottom right corner
      handles.push({
        x: obj.x + obj.width,
        y: obj.y + obj.height,
        cursor: 'nwse-resize',
        action: function(dx, dy) {
          obj.width = Math.max(10, obj.width + dx);
          obj.height = Math.max(10, obj.height + dy);
        }
      });
    } else if (obj.type === 'arrow') {
      // End point of arrow
      handles.push({
        x: obj.x2,
        y: obj.y2,
        cursor: 'move',
        action: function(dx, dy) {
          obj.x2 += dx;
          obj.y2 += dy;
        }
      });
      
      // Start point of arrow
      handles.push({
        x: obj.x1,
        y: obj.y1,
        cursor: 'move',
        action: function(dx, dy) {
          obj.x1 += dx;
          obj.y1 += dy;
        }
      });
      
      // Size handle (middle of arrow)
      const midX = (obj.x1 + obj.x2) / 2;
      const midY = (obj.y1 + obj.y2) / 2;
      handles.push({
        x: midX,
        y: midY,
        cursor: 'pointer',
        action: function(dx, dy) {
          // Adjust thickness
          obj.size = Math.max(1, obj.size + dy / 10);
        }
      });
    }
    
    return handles;
  }

  // Check if point is on a resize handle
  function getHandleAtPoint(x, y) {
    if (!selectedObject) return null;
    
    const handles = getResizeHandles(selectedObject);
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      const dx = handle.x - x;
      const dy = handle.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= handleSize) {
        return handle;
      }
    }
    
    return null;
  }

  // Mouse events
  canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a resize handle
    const handle = getHandleAtPoint(x, y);
    if (handle) {
      isResizing = true;
      resizeHandle = handle;
      startX = x;
      startY = y;
      return;
    }
    
    // Check if clicking on an existing object
    for (let i = objects.length - 1; i >= 0; i--) {
      if (isPointInObject(x, y, objects[i])) {
        selectedObject = objects[i];
        isDragging = true;
        startX = x;
        startY = y;
        redraw();
        return;
      }
    }
    
    // If not clicking on an object and a tool is selected, start drawing
    if (currentTool) {
      isDrawing = true;
      startX = x;
      startY = y;
      
      if (currentTool === 'text') {
        const text = prompt('Enter text:', 'Sample Text');
        if (text) {
          ctx.font = `${parseInt(sizeSlider.value)}px Arial`;
          const textWidth = ctx.measureText(text).width;
          const newText = {
            type: 'text',
            x: x,
            y: y,
            text: text,
            color: colorPicker.value,
            size: parseInt(sizeSlider.value),
            width: textWidth,
            height: parseInt(sizeSlider.value)
          };
          objects.push(newText);
          selectedObject = newText;
          redraw();
        }
        isDrawing = false;
        resetToolButtons(); // Reset after adding text
      } else if (currentTool === 'rect') {
        tempObject = {
          type: 'rect',
          x: x,
          y: y,
          width: 0,
          height: 0,
          color: colorPicker.value,
          size: parseInt(sizeSlider.value)
        };
      } else if (currentTool === 'arrow') {
        tempObject = {
          type: 'arrow',
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          color: colorPicker.value,
          size: parseInt(sizeSlider.value)
        };
      }
    } else {
      // Deselect if clicking on empty space
      selectedObject = null;
      redraw();
    }
  });

  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor based on what's under it
    const handle = getHandleAtPoint(x, y);
    if (handle) {
      canvas.style.cursor = handle.cursor;
    } else if (isPointInAnyObject(x, y)) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'default';
    }
    
    if (isResizing && resizeHandle) {
      const dx = x - startX;
      const dy = y - startY;
      
      resizeHandle.action(dx, dy);
      
      startX = x;
      startY = y;
      redraw();
    } else if (isDragging && selectedObject) {
      const dx = x - startX;
      const dy = y - startY;
      
      if (selectedObject.type === 'text' || selectedObject.type === 'rect') {
        selectedObject.x += dx;
        selectedObject.y += dy;
      } else if (selectedObject.type === 'arrow') {
        selectedObject.x1 += dx;
        selectedObject.y1 += dy;
        selectedObject.x2 += dx;
        selectedObject.y2 += dy;
      }
      
      startX = x;
      startY = y;
      redraw();
    } else if (isDrawing && tempObject) {
      if (tempObject.type === 'rect') {
        tempObject.width = x - tempObject.x;
        tempObject.height = y - tempObject.y;
      } else if (tempObject.type === 'arrow') {
        tempObject.x2 = x;
        tempObject.y2 = y;
      }
      redraw();
      drawTempObject();
    }
  });

  canvas.addEventListener('mouseup', function() {
    if (isDrawing && tempObject) {
      if (tempObject.type === 'rect' || tempObject.type === 'arrow') {
        objects.push(tempObject);
        selectedObject = tempObject;
        resetToolButtons(); // Reset tool after completing drawing
      }
      tempObject = null;
    }
    
    isDragging = false;
    isResizing = false;
    resizeHandle = null;
    isDrawing = false;
    redraw();
  });

  // Helper functions
  function isPointInObject(x, y, obj) {
    if (obj.type === 'text' || obj.type === 'rect') {
      return x >= obj.x && x <= obj.x + (obj.width || 100) &&
             y >= obj.y && y <= obj.y + (obj.height || 20);
    } else if (obj.type === 'arrow') {
      // Check if point is near the arrow line
      const lineLength = Math.sqrt(Math.pow(obj.x2 - obj.x1, 2) + Math.pow(obj.y2 - obj.y1, 2));
      const distance = Math.abs((obj.y2 - obj.y1) * x - (obj.x2 - obj.x1) * y + obj.x2 * obj.y1 - obj.y2 * obj.x1) / lineLength;
      return distance < 10 && 
             x >= Math.min(obj.x1, obj.x2) - 10 && 
             x <= Math.max(obj.x1, obj.x2) + 10 && 
             y >= Math.min(obj.y1, obj.y2) - 10 && 
             y <= Math.max(obj.y1, obj.y2) + 10;
    }
    return false;
  }

  function isPointInAnyObject(x, y) {
    for (let i = 0; i < objects.length; i++) {
      if (isPointInObject(x, y, objects[i])) {
        return true;
      }
    }
    return false;
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if exists
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw all objects
    objects.forEach(obj => {
      drawObject(obj);
      
      // Draw selection highlight
      if (obj === selectedObject) {
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 2;
        
        if (obj.type === 'text' || obj.type === 'rect') {
          let width, height;
          
          if (obj.type === 'text') {
            // Update text measurements before drawing selection box
            ctx.font = `${obj.size}px Arial`;
            width = ctx.measureText(obj.text).width;
            height = obj.size;
            
            // Update the object's width and height properties
            obj.width = width;
            obj.height = height;
          } else {
            width = obj.width;
            height = obj.height;
          }
          
          ctx.strokeRect(obj.x - 5, obj.y - 5, width + 10, height + 10);
          
          // Draw resize handles
          drawResizeHandles(obj);
        } else if (obj.type === 'arrow') {
          // Draw control points
          drawResizeHandles(obj);
        }
      }
    });
  }

  function drawResizeHandles(obj) {
    const handles = getResizeHandles(obj);
    
    ctx.fillStyle = '#0099ff';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawTempObject() {
    if (!tempObject) return;
    
    drawObject(tempObject);
  }

  function drawObject(obj) {
    ctx.fillStyle = obj.color;
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = obj.size;
    
    if (obj.type === 'text') {
      ctx.font = `${obj.size}px Arial`;
      // Measure text width and update the object's width property
      const textWidth = ctx.measureText(obj.text).width;
      obj.width = textWidth;
      obj.height = obj.size;
      
      ctx.fillText(obj.text, obj.x, obj.y + obj.size);
    } else if (obj.type === 'rect') {
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    } else if (obj.type === 'arrow') {
      // Draw line
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
      const headLength = 15;
      
      ctx.beginPath();
      ctx.moveTo(obj.x2, obj.y2);
      ctx.lineTo(
        obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
        obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
        obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }
  }
});
</script>
