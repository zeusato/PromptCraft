import { GoogleGenAI } from "@google/genai";
import { PromptOutput, TaskType, AppLanguage } from "../types";
import { getApiKey } from "./db";

export const generateOptimizedPrompt = async (
  taskType: TaskType,
  subtype: string,
  userInputs: Record<string, any>,
  language: AppLanguage
): Promise<PromptOutput> => {

  // 1. Fetch API Key from IndexedDB
  const storedKey = await getApiKey();

  if (!storedKey) {
    throw new Error("MISSING_API_KEY");
  }

  // 2. Initialize Gemini Client
  const ai = new GoogleGenAI({ apiKey: storedKey });
  const modelId = "gemini-3-flash-preview";

  const systemInstruction = `
You are PromptCraft, an elite Prompt Generator AI specialized in creating detailed, production-ready prompts.

USER LANGUAGE SETTING: ${language === 'vi' ? 'Vietnamese' : 'English'}

CRITICAL RULES:
1. Generate ONLY the final prompt - no explanations or meta-commentary
2. final_prompt_text: MUST contain BOTH versions:
   - First: English version (for direct use with AI models)
   - Then: Vietnamese version (for user understanding)
   Format: "[ENGLISH]\n{english prompt}\n\n[TIẾNG VIỆT]\n{vietnamese prompt}"
3. final_prompt_json: Highly detailed structured JSON with all visual/technical details (keys in English, values can be bilingual if helpful)
4. assumptions: Brief notes about inferred details (in ${language === 'vi' ? 'Vietnamese' : 'English'})

OUTPUT MUST BE VALID JSON matching this exact structure:
{
  "inputs_raw": { /* simplified input summary */ },
  "completed_fields": { /* any AI-added fields */ },
  "assumptions": [ { "value": "...", "source": "model" } ],
  "final_prompt_text": "[ENGLISH]\\n...\\n\\n[TIẾNG VIỆT]\\n...",
  "final_prompt_json": { /* detailed structured prompt */ }
}
`;

  const parts: any[] = [];
  const cleanInputs: Record<string, any> = {};

  // Separate file/image data from text inputs
  for (const [key, value] of Object.entries(userInputs)) {
    if (value && typeof value === 'object' && value.mimeType && value.data) {
      cleanInputs[key] = `[Image: ${value.name}]`;
      parts.push({
        inlineData: {
          mimeType: value.mimeType,
          data: value.data
        }
      });
    } else if (value !== undefined && value !== null && value !== '') {
      cleanInputs[key] = value;
    }
  }

  // Build task-specific instructions
  let taskInstructions = '';

  if (taskType === TaskType.IMAGE) {
    // Build subtype-specific detailed instructions
    let subtypeInstructions = '';

    if (subtype === 'Analyze') {
      subtypeInstructions = `
**CRITICAL FOR ANALYZE MODE:**
You MUST extract EXTREMELY DETAILED descriptions from the provided image to enable accurate recreation.
Describe EXACTLY what you see - every detail matters for achieving 95%+ similarity:

1. POSE & BODY POSITION: Exact body orientation (front/side/3-4 view), arm positions (raised/lowered/bent angle), hand positions (fingers spread/closed/holding something), leg positions (crossed/apart/bent), head tilt angle, shoulder alignment

2. FACIAL EXPRESSION: Exact mouth shape (open/closed/slight smile/pursed), eye direction (looking at camera/up/down/side), eyebrow position (raised/relaxed/furrowed), overall emotion conveyed

3. CLOTHING DETAILS: 
   - Each garment separately (top, bottom, jacket, etc.)
   - Exact colors with shades (not just "red" but "deep burgundy" or "bright cherry red")
   - Fabric type and texture (shiny satin, matte cotton, fluffy fleece, leather grain)
   - How clothing fits (tight/loose, draped/structured)
   - Visible seams, buttons, zippers, patterns, logos
   - How clothing interacts with body (pulled on shoulder, tucked in, flowing)

4. ENVIRONMENT: 
   - Exact setting (indoor/outdoor, specific location type)
   - All visible objects and their positions relative to subject
   - Background depth and blur level
   - Surface textures (wood grain, marble pattern, fabric)
   - Weather/atmospheric conditions if visible

5. LIGHTING: 
   - Light source direction and type (natural/artificial, soft/hard)
   - Shadow placement and intensity
   - Highlights on skin, hair, clothing
   - Overall color temperature (warm/cool)

6. CAMERA: 
   - Exact shot framing (what body parts are visible, cropping)
   - Lens perspective (wide angle distortion or telephoto compression)
   - Depth of field (what's sharp vs blurred)
`;
    } else if (subtype === 'Generate') {
      subtypeInstructions = `
**CRITICAL FOR GENERATE MODE:**
Transform the user's basic concept into a professional, detailed prompt that will produce stunning results.

1. CHARACTER/SUBJECT DESIGN (if applicable):
   - Age, gender, ethnicity, distinctive features
   - Facial expression that conveys emotion/story
   - Body type, pose, gesture, weight distribution
   - Hair: color, length, style, texture, movement
   - Skin: tone, texture, any unique characteristics

2. CLOTHING & ACCESSORIES (if applicable):
   - Full outfit description with layers
   - Specific colors (use precise terms: "burgundy", "teal", not just "red", "blue")
   - Fabric types and textures (silk, leather, wool, denim)
   - How clothing fits and moves (flowing, tight, oversized)
   - Accessories: jewelry, bags, hats, glasses with details
   - Shoes/footwear if visible

3. ENVIRONMENT DESIGN:
   - Specific location (not just "city" but "rain-soaked Tokyo street at night")
   - Time of day with specific lighting conditions
   - Weather and atmosphere
   - Foreground, midground, background elements
   - Props and environmental details
   - Mood and ambiance

4. LIGHTING SETUP (Critical for quality):
   - Light source type: natural (golden hour, overcast) or artificial (studio, neon, practical)
   - Direction: front, side, back, rim, loop, Rembrandt
   - Quality: soft/diffused vs hard/dramatic
   - Color temperature and color accents
   - Shadow characteristics
   - Special effects: lens flare, bokeh, god rays

5. CAMERA & COMPOSITION:
   - Shot type: extreme close-up, portrait, full body, wide establishing
   - Angle: eye level, low angle (heroic), high angle, dutch tilt
   - Lens simulation: 24mm wide, 50mm natural, 85mm portrait, 200mm telephoto
   - Depth of field: shallow bokeh vs deep focus
   - Composition: rule of thirds, centered, golden ratio, leading lines
   - Framing elements

6. STYLE & QUALITY KEYWORDS:
   FOR PHOTOGRAPHY:
   - "professional photography", "editorial", "fashion shoot", "DSLR", "RAW photo"
   - Lighting terms: "studio lighting", "Rembrandt lighting", "butterfly lighting"
   - Quality: "8k", "highly detailed", "sharp focus", "photorealistic"
   
   FOR ILLUSTRATION/ART:
   - Style: "digital art", "concept art", "oil painting", "watercolor"
   - Artist references if appropriate
   - "trending on artstation", "deviantart featured"
   
   FOR 3D/RENDER:
   - "3D render", "octane render", "unreal engine 5", "ray tracing"
   - "subsurface scattering", "volumetric lighting"

7. NEGATIVE ELEMENTS (what to avoid):
   - Common artifacts: "deformed", "bad anatomy", "extra limbs", "blurry"
   - Quality issues: "low quality", "jpeg artifacts", "watermark"
   - Unwanted elements based on context

8. REFERENCE IMAGE INTEGRATION (if provided):
   - Use style/mood from reference
   - Apply color palette from reference
   - Match composition or pose inspiration
   - Note: "Use provided reference image for [specific element]"
`;
    } else if (subtype === 'Compose') {
      subtypeInstructions = `
**CRITICAL FOR COMPOSE MODE:**
You are combining elements from MULTIPLE reference images into one cohesive image.
Analyze EACH provided image carefully and extract the specified elements:

IMAGE SOURCES & WHAT TO EXTRACT:
- contextImg (Background/Scene): Extract the FULL environment - setting, lighting, atmosphere, props, colors, mood
- charImg (Character/Face): Extract the EXACT face features, identity, skin tone, facial expression - this person's face MUST be in the final image
- outfitImg (Outfit): Extract the COMPLETE clothing - every garment, colors, fabrics, textures, accessories, how it fits
- poseImg (Pose): Extract the EXACT body position - orientation, arm angles, leg positions, hand gestures, weight distribution

COMPOSITION RULES:
1. The FACE from charImg takes priority - the final image must feature THIS person's identity
2. Describe the outfit from outfitImg as if the charImg person is wearing it
3. Place the character in the environment from contextImg with matching lighting
4. Apply the exact pose from poseImg to the character

IMPORTANT: The final prompt must explicitly instruct:
- "Use the face and identity from [Character Image]"
- "Wearing the outfit from [Outfit Image]"  
- "In the pose from [Pose Image]"
- "Set in the environment from [Context Image]"
- "Combine all provided reference images to create a cohesive final image"

If any image is missing, use the user's text description or make creative choices that match the overall style.
`;
    }

    taskInstructions = `
TASK: IMAGE PROMPT (${subtype})

${subtypeInstructions}

Generate a comprehensive image prompt with this JSON structure for final_prompt_json:
{
  "subject": "complete description of main subject",
  "reference_images_used": {
    "context": "description of what was taken from contextImg if provided",
    "character": "face/identity from charImg if provided", 
    "outfit": "clothing from outfitImg if provided",
    "pose": "body position from poseImg if provided"
  },
  "appearance": {
    "age": "specific age or range", 
    "gender": "...", 
    "ethnicity": "...", 
    "skin_tone": "detailed description with undertones",
    "face": "face shape, jawline, cheeks details",
    "eyes": "exact color, size, shape, lashes, direction of gaze",
    "eyebrows": "shape, thickness, arch, grooming",
    "nose": "shape and size",
    "lips": "shape, fullness, color",
    "makeup": "detailed makeup description if any",
    "hair": { 
      "color": "exact shade", 
      "length": "specific length", 
      "style": "detailed style description",
      "texture": "straight/wavy/curly, shine level",
      "details": "flyaways, accessories, how it falls"
    },
    "body": { 
      "build": "body type", 
      "pose": "EXTREMELY DETAILED: body orientation, arm positions with angles, hand positions, leg positions, weight distribution",
      "gesture": "specific hand/finger positions, any movement implied",
      "expression": "detailed facial expression, emotion, eye contact"
    }
  },
  "clothing": {
    "overall_style": "fashion style category",
    "layers": "describe each visible layer from outer to inner",
    "top": "detailed: type, color, fabric, fit, neckline, sleeves, how it sits on body",
    "bottom": "detailed: type, color, fabric, fit, length, how it drapes",
    "outerwear": "if any: type, color, fabric, how worn (open/closed, draped)",
    "accessories": { 
      "jewelry": "each piece with position",
      "footwear": "type, color, style",
      "bags": "if visible",
      "other": "belts, hats, glasses, etc."
    },
    "fabric_textures": "specific textures visible (shiny, matte, fluffy, leather grain)",
    "clothing_interaction": "how clothes move or sit on the body"
  },
  "environment": {
    "setting": "specific location description",
    "indoor_outdoor": "...",
    "season": "if determinable",
    "time_of_day": "if determinable",
    "background_elements": { 
      "immediate": "objects/elements right behind subject",
      "middle_ground": "...",
      "far_background": "...",
      "blur_level": "how blurred is background"
    },
    "ground_surface": "what subject is standing/sitting on",
    "props": "any objects subject is interacting with",
    "atmosphere": "mood, weather, ambiance"
  },
  "lighting": {
    "type": "natural/artificial/mixed",
    "source_direction": "where light comes from",
    "quality": "soft/hard, diffused/direct",
    "shadows": "shadow placement and intensity",
    "highlights": "where highlights appear",
    "color_temperature": "warm/cool/neutral",
    "mood": "overall lighting mood"
  },
  "camera": {
    "shot_type": "extreme close-up/close-up/medium/full/wide",
    "framing": "what body parts are visible, exact crop",
    "angle": "eye level/high/low, front/side/3-4 view",
    "orientation": "portrait/landscape",
    "lens": "estimated focal length effect",
    "focus": "what is sharp, what is blurred",
    "depth_of_field": "shallow/deep"
  },
  "style": {
    "art_style": "photography type or artistic style",
    "color_palette": "dominant colors and their relationships",
    "color_grading": "any visible color treatment",
    "render_quality": "resolution quality descriptors",
    "aesthetic": "overall visual style category"
  },
  "composition": {
    "subject_position": "where subject is placed in frame",
    "main_focus": "what draws eye first",
    "foreground": "elements in front of subject",
    "background": "elements behind subject",
    "negative_space": "empty areas and their role",
    "visual_flow": "how eye moves through image"
  },
  "technical_notes": "any additional technical details for accurate recreation",
  "note": "IMPORTANT: Use all provided reference images. Face/identity from Character Image, outfit from Outfit Image, pose from Pose Image, environment from Context Image. Combine seamlessly."
}

SUBTYPE RULES:
- Generate: Create new image from text description, fill in creative details. If reference images provided, use them as inspiration.
- Analyze: Extract MAXIMUM detail from provided image for accurate recreation - be exhaustively specific about every visual element.
- Compose: COMBINE elements from multiple reference images (contextImg=scene, charImg=face, outfitImg=clothes, poseImg=pose). The final prompt MUST reference using all provided images together.
`;
  } else if (taskType === TaskType.VIDEO) {
    // Determine video count and subtype for specific instructions
    const videoCount = parseInt(cleanInputs.count) || 1;
    const isMultiVideo = videoCount > 1;

    let subtypeInstructions = '';

    if (subtype === 'Prompt') {
      subtypeInstructions = `
**MODE: TEXT-TO-VIDEO (Pure Prompt)**

BASIC COMPONENTS (8 Essential Fields - always fill):
1. Ý tưởng/Nội dung chính: What happens in the video in one sentence
2. Bối cảnh (Environment): Location, time of day, weather, atmosphere
3. Nhân vật/Chủ thể (Subjects): Who/what appears, count, basic identification
4. Hành động/Chuyển động (Action): What subject does, how they move, rhythm/pace
5. Phong cách hình ảnh (Visual Style): cinematic/anime/realistic/3D/documentary
6. Âm thanh tổng quan (Audio): ambience + music + sfx + mood (CRITICAL)
7. Duration: ${cleanInputs.duration || '5s'}
8. Aspect Ratio: ${cleanInputs.ratio || '16:9'}

ADVANCED COMPONENTS (fill from user inputs or infer for quality):
- Camera/Cinematography:
  * Góc máy: close-up/medium/wide, POV, over-the-shoulder
  * Chuyển động camera: pan/tilt/dolly/track/handheld/steadycam/drone
  * Lens feel: 24mm wide / 50mm natural / telephoto, depth of field, bokeh
  * Framing: rule of thirds, center, leading lines
  
- Lighting/Color:
  * Ánh sáng: soft/hard/backlight/neon/golden hour
  * Color grading: teal-orange, desaturated, warm, high contrast
  
- Continuity (especially for multi-video):
  * Lock character appearance, outfit, environment style
  
- Audio Detail:
  * Ambience: specific sounds (city rain, forest birds, room tone)
  * Music: genre + tempo + instruments
  * SFX: specific sound effects
  
- Negative: flicker, extra limbs, distorted face, text artifacts, jitter

${isMultiVideo ? `
**MULTI-VIDEO MODE (${videoCount} clips):**
CRITICAL: Generate ${videoCount} separate prompts with:
1. CONTINUITY ANCHORS (shared): character, environment, style, palette, time of day
2. AUDIO BRIDGING per clip:
   - Consistent ambient bed throughout (e.g. "light rain room tone")
   - If music: same genre/tempo/key for seamless editing
   - AVOID dialogue dependencies between clips (generated independently)
3. Each prompt must be independently executable but visually cohesive
` : ''}
`;
    } else if (subtype === 'Img2Video') {
      subtypeInstructions = `
**MODE: IMAGE-TO-VIDEO**

Analyze the provided first frame image and create motion from it.

REQUIRED ANALYSIS:
1. First Frame Content: Describe exactly what's in the starting image
2. Motion Intent: ${cleanInputs.motionIntent || 'subtle'} (subtle/medium/dynamic)
3. What Changes: What should move? (subject motion, camera movement, environment changes)
4. Style Preservation: Keep the exact visual style from the source image

${cleanInputs.lastFrame ? `
LAST FRAME PROVIDED:
- Describe trajectory from first frame to last frame
- Define the motion path and transformation
- Ensure smooth transition between states
` : ''}

CAMERA PATH:
- Starting position (from first frame analysis)
- Movement type: pan/zoom/orbit/static
- Ending position

CONSISTENCY RULES:
- Character appearance must remain identical
- Lighting and color grading must match source
- Environment details preserved
`;
    } else if (subtype === 'Extend') {
      subtypeInstructions = `
**MODE: EXTEND VIDEO**

Continue seamlessly from the previous video context.

BASE CONTEXT PROVIDED:
${cleanInputs.basePrompt || 'No base prompt provided - infer from extension idea'}

EXTENSION REQUIREMENTS:
1. New Content: ${cleanInputs.extensionIdea || 'Continue the action naturally'}
2. Maintain Consistency: ${cleanInputs.keepConsistency !== false ? 'YES - Keep character/environment/style/audio consistent' : 'Allow variations'}

CRITICAL CONTINUITY:
- Inherit: Character appearance, outfit, environment, visual style, color grading
- Audio: Match previous ambience, continue music motif, consistent sound design
- Camera: Maintain similar cinematography style
- Action: Smooth continuation, no jarring jumps

The prompt must feel like a seamless continuation, not a new scene.
`;
    }

    taskInstructions = `
TASK: VIDEO PROMPT (${subtype})

${subtypeInstructions}

Generate comprehensive video prompt(s). For final_prompt_json use:

${isMultiVideo ? `
MULTI-VIDEO OUTPUT (${videoCount} clips):
{
  "continuity_anchors": {
    "character": "detailed character description that remains constant",
    "outfit": "exact clothing that stays the same",
    "environment_style": "consistent environment elements",
    "visual_style": "locked visual style and color grading",
    "time_of_day": "consistent time/lighting",
    "audio_bed": "consistent ambient sound throughout all clips"
  },
  "audio_bridging": {
    "ambience": "continuous ambient sound across clips",
    "music": { "genre": "...", "tempo": "...", "mood": "..." },
    "consistency_notes": "how audio connects between clips"
  },
  "prompts": [
    {
      "id": 1,
      "visual_prompt": "complete visual description for clip 1",
      "action": "specific action/motion in this clip",
      "camera": { "shot": "...", "movement": "...", "lens": "..." },
      "audio": { "sfx": "...", "music_notes": "...", "dialogue": "..." },
      "transition_to_next": "how this clip leads to the next"
    },
    // ... repeat for each clip
  ]
}
` : `
SINGLE VIDEO OUTPUT:
{
  "scene_summary": "one-line description of what happens",
  "subject": {
    "description": "who/what appears, detailed identification",
    "action": "what they do, movement description",
    "expression": "emotional state, facial expression"
  },
  "environment": {
    "setting": "specific location",
    "time_of_day": "morning/noon/evening/night",
    "weather": "conditions if relevant",
    "atmosphere": "mood of the scene"
  },
  "camera": {
    "shot_type": "close-up/medium/wide/extreme wide",
    "angle": "eye level/low/high/dutch",
    "movement": "static/pan/tilt/dolly/track/handheld/drone",
    "lens": "wide 24mm / natural 50mm / telephoto",
    "composition": "framing notes"
  },
  "lighting": {
    "type": "natural/artificial/mixed",
    "quality": "soft/hard/dramatic",
    "direction": "front/side/back/rim",
    "color_temperature": "warm/cool/neutral",
    "special": "golden hour/neon/practical lights"
  },
  "audio": {
    "ambience": "environmental sounds",
    "music": { "genre": "...", "tempo": "...", "instruments": "...", "mood": "..." },
    "sfx": "specific sound effects",
    "voiceover": "if any - gender, tone, speed"
  },
  "visual_style": "cinematic/anime/realistic/3D/documentary/etc",
  "color_grading": "teal-orange/desaturated/warm/high contrast/etc",
  "duration": "${cleanInputs.duration || '5s'}",
  "aspect_ratio": "${cleanInputs.ratio || '16:9'}",
  "negative_prompt": "things to avoid: flicker, distorted faces, jitter, etc",
  "technical_notes": "any additional prompting keywords for quality"
}
`}

${subtype === 'Img2Video' ? `
For Img2Video, include additional fields:
{
  "source_frame_analysis": "description of the first frame image",
  "motion_intent": "${cleanInputs.motionIntent || 'subtle'}",
  "motion_content": "what specifically moves and how",
  "style_preservation": "how source image style is maintained",
  "camera_path": "camera movement from start to end"
}
` : ''}

${subtype === 'Extend' ? `
For Extend, include additional fields:
{
  "base_context_inherited": "what carries over from previous video",
  "new_content": "what happens in the extension",
  "continuity_check": "character/outfit/environment/style/audio consistency"
}
` : ''}
`;
  } else if (taskType === TaskType.RESEARCH) {
    const depth = cleanInputs.depth || 'standard';

    taskInstructions = `
TASK: RESEARCH / ANALYSIS PROMPT

Create a comprehensive research prompt that can be used with AI research assistants or search tools.

RESEARCH DEPTH: ${depth}
${depth === 'quick' ? '- Quick overview, key points only, 1-2 pages equivalent' : ''}
${depth === 'standard' ? '- Balanced analysis, main arguments with evidence, 3-5 pages equivalent' : ''}
${depth === 'deep' ? '- Exhaustive deep-dive, multiple perspectives, citations, 10+ pages equivalent' : ''}

PROMPT STRUCTURE GUIDELINES:

1. RESEARCH QUESTION/OBJECTIVE
   - Clear, specific research question
   - What exactly needs to be understood/answered
   - Success criteria for the research

2. SCOPE & BOUNDARIES
   - Timeframe (historical period, recent, forecast)
   - Geographic scope if relevant
   - Industry/sector focus
   - What to include vs exclude

3. KEY AREAS TO INVESTIGATE
   - Main topics/themes to cover
   - Specific sub-questions
   - Comparative analysis points if any

4. DATA & SOURCES
   - Types of sources preferred (academic, industry reports, news)
   - Specific sources/databases if known
   - Data requirements (statistics, case studies, expert opinions)

5. ANALYSIS FRAMEWORK
   - Analytical approach (SWOT, PESTEL, Porter's 5, etc.)
   - Comparison criteria
   - Evaluation metrics

6. OUTPUT FORMAT
   - Structure (executive summary, sections, conclusion)
   - Deliverables (report, bullet points, table, recommendations)
   - Level of detail expected

7. CRITICAL THINKING
   - Potential biases to watch for
   - Alternative viewpoints to consider
   - Risks and uncertainties to highlight

Generate final_prompt_json with this structure:
{
  "research_question": {
    "main_question": "primary research question",
    "sub_questions": ["supporting questions to answer"]
  },
  "objective": "what the research aims to achieve",
  "context": "background or motivation for this research",
  "scope": {
    "timeframe": "${cleanInputs.timeframe || 'current and recent (last 1-2 years)'}",
    "geographic": "global/regional/country-specific",
    "sector": "industry or domain focus",
    "boundaries": "what is explicitly out of scope"
  },
  "methodology": {
    "approach": "qualitative/quantitative/mixed",
    "framework": "analytical framework to use (SWOT, PESTEL, etc.)",
    "data_types": ["statistics", "case studies", "expert opinions", "etc"]
  },
  "key_topics": [
    {
      "topic": "main topic area",
      "focus_points": ["specific aspects to investigate"],
      "questions": ["detailed questions for this topic"]
    }
  ],
  "sources": {
    "preferred": ["types of sources to prioritize"],
    "specific": ["any specific sources/databases"],
    "avoid": ["sources or types to avoid"]
  },
  "analysis": {
    "compare": ["items/options to compare if applicable"],
    "evaluate": ["criteria for evaluation"],
    "identify": ["patterns, trends, insights to look for"]
  },
  "output_format": {
    "structure": "${cleanInputs.format || 'structured report'}",
    "sections": ["executive summary", "findings", "analysis", "recommendations", "conclusion"],
    "deliverables": ["main report", "key takeaways", "data tables if relevant"],
    "length": "${depth === 'quick' ? 'concise (1-2 pages)' : depth === 'deep' ? 'comprehensive (10+ pages)' : 'standard (3-5 pages)'}"
  },
  "critical_notes": {
    "biases_to_avoid": ["potential biases to watch for"],
    "alternative_views": ["perspectives to consider"],
    "uncertainties": ["areas of uncertainty to acknowledge"]
  },
  "success_criteria": "what defines successful completion of this research"
}
`;
  } else if (taskType === TaskType.OUTLINE) {
    taskInstructions = `
TASK: OUTLINE/STRUCTURE PROMPT

Generate a content outline prompt. For final_prompt_json:
{
  "topic": "...",
  "purpose": "...",
  "target_audience": "${cleanInputs.audience || 'general'}",
  "goal": "${cleanInputs.goal || 'informative'}",
  "structure": {
    "introduction": "...",
    "main_sections": [
      { "title": "...", "key_points": [...], "subsections": [...] }
    ],
    "conclusion": "..."
  },
  "tone": "...",
  "length_estimate": "..."
}
`;
  } else if (taskType === TaskType.MUSIC) {
    taskInstructions = `
TASK: MUSIC PROMPT

Generate a music/song prompt. For final_prompt_json:
{
  "title_suggestion": "...",
  "genre": "${cleanInputs.genre || 'pop'}",
  "mood": "${cleanInputs.mood || 'upbeat'}",
  "tempo": "...",
  "instruments": [...],
  "vocals": { "style": "...", "gender": "...", "characteristics": "..." },
  "structure": {
    "intro": "...",
    "verse": "...",
    "chorus": "...",
    "bridge": "...",
    "outro": "..."
  },
  "lyrics_theme": "...",
  "reference_artists": [...],
  "production_notes": "..."
}
`;
  }

  const promptText = `
${taskInstructions}

USER INPUTS:
${JSON.stringify(cleanInputs, null, 2)}

Generate the complete prompt now. Remember:
- final_prompt_text: Natural language prompt ready to copy
- final_prompt_json: Detailed structured JSON with ALL fields populated
- Keep assumptions minimal and relevant
`;

  // Insert the prompt text as the first part
  parts.unshift({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: parts }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 1.0,
        topP: 0.95,
        topK: 64,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");

    const result = JSON.parse(response.text);

    // Enrich with meta
    return {
      ...result,
      meta: {
        type: taskType,
        subtype,
        createdAt: new Date().toISOString()
      }
    } as PromptOutput;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};