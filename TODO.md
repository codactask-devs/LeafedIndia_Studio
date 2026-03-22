# Box Template SVG Editor - Implementation TODO

Current Progress: Step 1 started.

## 1. Setup & Dependencies ✅ Complete

- [x] Created TODO.md
- [x] Added @emailjs/browser to package.json (fixed JSON, moved from .fixed, npm install done)
- [x] svgParser.js created w/ FOOD BOX.svg parsed (polygon/path extraction)
- Note: Sign up EmailJS.com free: Add service (gmail/yopmail), create template w/ {{pdf_base64}} field, get SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY for later config

## 2. Remove Shapes/Text

- [] Edit Sidebar.jsx: Remove Shapes/Text UI
- [] Edit App.jsx: Remove shape/text addObject cases
- [] Edit CanvasArea.jsx: Remove shape/text render + text edit logic
- [] Edit Sidebar.jsx: Remove text fontSize slider

## 3. SVG Template Support

- [] Peek SVG structure (done next)
- [] useStore.js: add loadSvgTemplate(x,y) - parse SVG to Konva Path objects
- [] App.jsx: Add drag handler 'svg-template'
- [] Sidebar.jsx: Add SVG template draggable button
- [] CanvasArea.jsx: Add render type:'svg-path' (Path data={d} fill stroke draggable)

## 4. SVG Edit Mode

- [] Sidebar properties: Add stroke color picker (besides fill)
- [] Select container -> edit children paths

## 5. Image Upload ✅ Exists

- No change

## 6. PDF + Email

- [] App.jsx: Add EmailJS.sendForm or send (PDF blob)
- [] Toolbar.jsx: Email button

## 7. Test & Complete

- [] Full test
- [] attempt_completion

Updated after each step.
