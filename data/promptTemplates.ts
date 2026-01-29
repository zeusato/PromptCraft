import { TaskType, PromptTemplate } from '../types';

export const promptTemplates: PromptTemplate[] = [
    // ========== IMAGE (6) ==========
    {
        id: 'upscale-image',
        title: 'Tăng chất lượng ảnh',
        titleEn: 'Upscale Image',
        icon: 'photo_size_select_large',
        category: TaskType.IMAGE,
        description: 'Tăng độ phân giải và chất lượng ảnh',
        descriptionEn: 'Increase image resolution and quality',
        template: `***CONTEXT***
[REFERENCE IMAGE ATTACHED]
Analyze the attached reference image carefully. This is the source image that needs to be upscaled and enhanced.

***TASK***
Upscale and enhance this reference image with the following specifications:

***INPUT DATA***
- Scale factor: {{scale}}x
- Target dimensions: {{width}}x{{height}} pixels
- Enhancement focus: {{focus}}
- Style preservation: {{preserve_style}}
- Output format: {{format}}

***INSTRUCTIONS***
1. Maintain the exact visual identity, colors, and composition of the reference image
2. Enhance details without altering the original content
3. If the image contains faces, preserve facial features accurately
4. Apply intelligent noise reduction while keeping textures
5. Output a higher resolution version that looks natural, not artificially sharpened`,
        variables: [
            {
                key: 'scale',
                label: 'Hệ số phóng đại',
                labelEn: 'Scale Factor',
                type: 'select',
                options: [
                    { value: '2', label: '2x', labelEn: '2x' },
                    { value: '4', label: '4x', labelEn: '4x' },
                    { value: '8', label: '8x', labelEn: '8x' }
                ],
                default: '4'
            },
            {
                key: 'width',
                label: 'Chiều rộng (px)',
                labelEn: 'Width (px)',
                type: 'number',
                placeholder: '1920',
                placeholderEn: '1920',
                default: '1920'
            },
            {
                key: 'height',
                label: 'Chiều cao (px)',
                labelEn: 'Height (px)',
                type: 'number',
                placeholder: '1080',
                placeholderEn: '1080',
                default: '1080'
            },
            {
                key: 'focus',
                label: 'Tập trung vào',
                labelEn: 'Enhancement Focus',
                type: 'select',
                options: [
                    { value: 'details', label: 'Chi tiết', labelEn: 'Details' },
                    { value: 'faces', label: 'Khuôn mặt', labelEn: 'Faces' },
                    { value: 'textures', label: 'Texture', labelEn: 'Textures' },
                    { value: 'all', label: 'Tất cả', labelEn: 'All' }
                ],
                default: 'all'
            },
            {
                key: 'preserve_style',
                label: 'Giữ nguyên style',
                labelEn: 'Preserve Style',
                type: 'select',
                options: [
                    { value: 'yes', label: 'Có', labelEn: 'Yes' },
                    { value: 'no', label: 'Không', labelEn: 'No' }
                ],
                default: 'yes'
            },
            {
                key: 'format',
                label: 'Định dạng output',
                labelEn: 'Output Format',
                type: 'select',
                options: [
                    { value: 'PNG', label: 'PNG', labelEn: 'PNG' },
                    { value: 'JPEG', label: 'JPEG', labelEn: 'JPEG' },
                    { value: 'WebP', label: 'WebP', labelEn: 'WebP' }
                ],
                default: 'PNG'
            }
        ]
    },
    {
        id: 'remove-background',
        title: 'Xóa nền ảnh',
        titleEn: 'Remove Background',
        icon: 'content_cut',
        category: TaskType.IMAGE,
        description: 'Tách chủ thể khỏi nền ảnh',
        descriptionEn: 'Remove background from image',
        template: `***CONTEXT***
[REFERENCE IMAGE ATTACHED]
Analyze the attached reference image carefully. This image contains a subject that needs to be extracted from its background.

***TASK***
Remove the background from this reference image.

***INPUT DATA***
- Subject type: {{subject_type}}
- Edge handling: {{edge_quality}}
- Output type: {{output_type}}
- Optional replacement: {{replace_bg}}

***INSTRUCTIONS***
1. Identify the main subject in the reference image ({{subject_type}})
2. Create a precise mask around the subject, paying special attention to:
   - Hair strands and fine details
   - Semi-transparent areas
   - Complex edges and boundaries
3. Apply {{edge_quality}} edge processing to ensure natural-looking cutout
4. Preserve all details of the subject exactly as shown in the reference
5. Output with {{output_type}} background
6. Ensure no background remnants remain around the subject edges`,
        variables: [
            {
                key: 'subject_type',
                label: 'Loại chủ thể',
                labelEn: 'Subject Type',
                type: 'select',
                options: [
                    { value: 'person', label: 'Người', labelEn: 'Person' },
                    { value: 'product', label: 'Sản phẩm', labelEn: 'Product' },
                    { value: 'animal', label: 'Động vật', labelEn: 'Animal' },
                    { value: 'object', label: 'Vật thể', labelEn: 'Object' }
                ],
                default: 'person'
            },
            {
                key: 'edge_quality',
                label: 'Chất lượng viền',
                labelEn: 'Edge Quality',
                type: 'select',
                options: [
                    { value: 'sharp', label: 'Sắc nét', labelEn: 'Sharp' },
                    { value: 'smooth', label: 'Mượt', labelEn: 'Smooth' },
                    { value: 'feathered', label: 'Mờ dần', labelEn: 'Feathered' }
                ],
                default: 'smooth'
            },
            {
                key: 'output_type',
                label: 'Loại output',
                labelEn: 'Output Type',
                type: 'select',
                options: [
                    { value: 'transparent', label: 'Nền trong suốt', labelEn: 'Transparent' },
                    { value: 'white', label: 'Nền trắng', labelEn: 'White background' },
                    { value: 'custom', label: 'Tùy chỉnh', labelEn: 'Custom' }
                ],
                default: 'transparent'
            },
            {
                key: 'replace_bg',
                label: 'Thay bằng nền (tùy chọn)',
                labelEn: 'Replace with background (optional)',
                type: 'text',
                placeholder: 'VD: gradient xanh dương, studio lighting...',
                placeholderEn: 'E.g.: blue gradient, studio lighting...'
            }
        ]
    },
    {
        id: 'id-photo',
        title: 'Ảnh giấy tờ tùy thân',
        titleEn: 'ID Photo Generator',
        icon: 'badge',
        category: TaskType.IMAGE,
        description: 'Tạo ảnh thẻ chuẩn cho giấy tờ từ ảnh selfie',
        descriptionEn: 'Generate standard ID photos from selfie',
        template: `***CONTEXT***
[REFERENCE SELFIE/PORTRAIT ATTACHED]
Analyze the attached reference photo carefully. This is the source image of the person who needs a professional ID photo.

***TASK***
Transform this reference selfie/portrait into a professional ID photo.

***INPUT DATA***
- Photo type: {{photo_type}}
- Background color: {{bg_color}}
- Dimensions: {{dimensions}}
- Face position: {{face_ratio}}% height
- Expression: {{expression}}
- Dress code: {{dress_code}}

***INSTRUCTIONS***
1. **Person Identification:** Extract and preserve the exact facial features, skin tone, hair color/style from the reference image.
2. **Face Integrity:** Use the EXACT face from the reference - same eyes, nose, mouth. DO NOT alter features.
3. **Styling:** Apply the requested dress code and lighting (even, soft, no harsh shadows).
4. **Correction:** Ensure eyes look directly at camera. Hair should appear neat.
5. **Compliance:** Ensure output meets standard requirements for {{photo_type}}.`,
        variables: [
            {
                key: 'photo_type',
                label: 'Loại ảnh',
                labelEn: 'Photo Type',
                type: 'select',
                options: [
                    { value: 'passport', label: 'Hộ chiếu', labelEn: 'Passport' },
                    { value: 'visa', label: 'Visa', labelEn: 'Visa' },
                    { value: 'cccd', label: 'CCCD/CMND', labelEn: 'National ID' },
                    { value: 'driver', label: 'Bằng lái xe', labelEn: 'Driver License' },
                    { value: 'resume', label: 'CV/Hồ sơ', labelEn: 'Resume/CV' }
                ],
                default: 'passport'
            },
            {
                key: 'bg_color',
                label: 'Màu nền',
                labelEn: 'Background Color',
                type: 'select',
                options: [
                    { value: 'white', label: 'Trắng', labelEn: 'White' },
                    { value: 'blue', label: 'Xanh dương', labelEn: 'Blue' },
                    { value: 'red', label: 'Đỏ', labelEn: 'Red' },
                    { value: 'gray', label: 'Xám nhạt', labelEn: 'Light Gray' }
                ],
                default: 'white'
            },
            {
                key: 'dimensions',
                label: 'Kích thước',
                labelEn: 'Dimensions',
                type: 'select',
                options: [
                    { value: '3x4', label: '3x4 cm', labelEn: '3x4 cm' },
                    { value: '4x6', label: '4x6 cm', labelEn: '4x6 cm' },
                    { value: '2x2inch', label: '2x2 inch (US)', labelEn: '2x2 inch (US)' },
                    { value: '35x45', label: '35x45 mm (EU)', labelEn: '35x45 mm (EU)' }
                ],
                default: '3x4'
            },
            {
                key: 'face_ratio',
                label: 'Tỷ lệ mặt (%)',
                labelEn: 'Face Ratio (%)',
                type: 'select',
                options: [
                    { value: '70', label: '70%', labelEn: '70%' },
                    { value: '75', label: '75%', labelEn: '75%' },
                    { value: '80', label: '80%', labelEn: '80%' }
                ],
                default: '75'
            },
            {
                key: 'expression',
                label: 'Biểu cảm',
                labelEn: 'Expression',
                type: 'select',
                options: [
                    { value: 'neutral', label: 'Trung tính', labelEn: 'Neutral' },
                    { value: 'slight_smile', label: 'Cười nhẹ', labelEn: 'Slight smile' }
                ],
                default: 'neutral'
            },
            {
                key: 'dress_code',
                label: 'Trang phục',
                labelEn: 'Dress Code',
                type: 'select',
                options: [
                    { value: 'white_shirt', label: 'Áo sơ mi trắng', labelEn: 'White shirt' },
                    { value: 'formal_suit', label: 'Veston/Comple', labelEn: 'Formal Suit' },
                    { value: 'keep_original', label: 'Giữ nguyên ảnh gốc', labelEn: 'Keep from reference' }
                ],
                default: 'white_shirt'
            }
        ]
    },
    {
        id: 'deblur-sharpen',
        title: 'Làm rõ ảnh mờ',
        titleEn: 'Deblur & Sharpen',
        icon: 'blur_off',
        category: TaskType.IMAGE,
        description: 'Khử mờ, làm sắc nét ảnh',
        descriptionEn: 'Remove blur and sharpen image',
        template: `***CONTEXT***
[BLURRY REFERENCE IMAGE ATTACHED]
Analyze the attached reference image carefully. This image is blurry/out of focus and needs to be restored to clarity.

***TASK***
Deblur and sharpen this reference image while preserving its original content.

***INPUT DATA***
- Blur type: {{blur_type}}
- Sharpening level: {{sharpen_level}}
- Noise reduction: {{noise_reduction}}
- Priority: {{preserve}}

***INSTRUCTIONS***
1. Analyze the reference image to understand what the original scene/subject should look like
2. Reconstruct lost details by intelligently inferring from available information
3. If the reference contains faces, restore facial features to look natural and recognizable
4. If the reference contains text, make text readable again
5. Maintain the original colors, lighting, and composition exactly
6. Apply noise reduction WITHOUT losing important texture details
7. The output should look like a naturally sharp photo, not over-processed
8. Do not add elements that don't exist in the original reference`,
        variables: [
            {
                key: 'blur_type',
                label: 'Loại mờ',
                labelEn: 'Blur Type',
                type: 'select',
                options: [
                    { value: 'motion', label: 'Mờ chuyển động', labelEn: 'Motion blur' },
                    { value: 'out_of_focus', label: 'Mất nét', labelEn: 'Out of focus' },
                    { value: 'gaussian', label: 'Mờ Gaussian', labelEn: 'Gaussian blur' },
                    { value: 'unknown', label: 'Không rõ', labelEn: 'Unknown' }
                ],
                default: 'unknown'
            },
            {
                key: 'sharpen_level',
                label: 'Mức độ làm nét',
                labelEn: 'Sharpening Level',
                type: 'select',
                options: [
                    { value: 'light', label: 'Nhẹ', labelEn: 'Light' },
                    { value: 'medium', label: 'Vừa', labelEn: 'Medium' },
                    { value: 'strong', label: 'Mạnh', labelEn: 'Strong' }
                ],
                default: 'medium'
            },
            {
                key: 'noise_reduction',
                label: 'Giảm noise',
                labelEn: 'Noise Reduction',
                type: 'select',
                options: [
                    { value: 'none', label: 'Không', labelEn: 'None' },
                    { value: 'light', label: 'Nhẹ', labelEn: 'Light' },
                    { value: 'medium', label: 'Vừa', labelEn: 'Medium' }
                ],
                default: 'light'
            },
            {
                key: 'preserve',
                label: 'Ưu tiên giữ',
                labelEn: 'Preserve',
                type: 'select',
                options: [
                    { value: 'faces', label: 'Khuôn mặt', labelEn: 'Faces' },
                    { value: 'text', label: 'Chữ', labelEn: 'Text' },
                    { value: 'edges', label: 'Cạnh/đường nét', labelEn: 'Edges' },
                    { value: 'all', label: 'Tất cả', labelEn: 'All' }
                ],
                default: 'all'
            }
        ]
    },
    {
        id: 'remove-object',
        title: 'Xóa vật thể khỏi ảnh',
        titleEn: 'Remove Object',
        icon: 'delete_sweep',
        category: TaskType.IMAGE,
        description: 'Xóa vật thể không mong muốn khỏi ảnh',
        descriptionEn: 'Remove unwanted objects from image',
        template: `***CONTEXT***
[REFERENCE IMAGE ATTACHED]
Analyze the attached reference image carefully. This image contains unwanted object(s) that need to be removed.

***TASK***
Remove the specified object(s) from this reference image seamlessly.

***INPUT DATA***
- Object to remove: {{object_description}}
- Location: {{location}}
- Fill method: {{fill_method}}

***INSTRUCTIONS***
1. Carefully identify the object to remove based on the description above
2. Analyze the surrounding area to understand replacement context
3. Use {{fill_method}} to fill the removed area
4. Ensure the filled area matches lighting, shadows, texture, and perspective
5. The edit should be completely invisible - "seamless"
6. Do NOT accidentally remove other important elements nearby
7. Maintain the overall composition and aesthetic`,
        variables: [
            {
                key: 'object_description',
                label: 'Mô tả vật thể cần xóa',
                labelEn: 'Object to Remove',
                type: 'textarea',
                placeholder: 'VD: Người đứng bên phải, cột điện phía sau, logo trên áo...',
                placeholderEn: 'E.g.: Person on the right, power pole in background, logo on shirt...'
            },
            {
                key: 'location',
                label: 'Vị trí',
                labelEn: 'Location',
                type: 'select',
                options: [
                    { value: 'foreground', label: 'Phía trước', labelEn: 'Foreground' },
                    { value: 'background', label: 'Phía sau', labelEn: 'Background' },
                    { value: 'left', label: 'Bên trái', labelEn: 'Left side' },
                    { value: 'right', label: 'Bên phải', labelEn: 'Right side' },
                    { value: 'center', label: 'Ở giữa', labelEn: 'Center' }
                ],
                default: 'background'
            },
            {
                key: 'fill_method',
                label: 'Cách lấp đầy',
                labelEn: 'Fill Method',
                type: 'select',
                options: [
                    { value: 'content_aware', label: 'Tự động (content-aware)', labelEn: 'Content-aware' },
                    { value: 'clone', label: 'Clone từ xung quanh', labelEn: 'Clone nearby' },
                    { value: 'generate', label: 'AI tạo mới', labelEn: 'AI generate' }
                ],
                default: 'content_aware'
            }
        ]
    },
    {
        id: 'colorize-bw',
        title: 'Tô màu ảnh đen trắng',
        titleEn: 'Colorize B&W',
        icon: 'palette',
        category: TaskType.IMAGE,
        description: 'Thêm màu sắc cho ảnh đen trắng',
        descriptionEn: 'Add colors to black & white photos',
        template: `***CONTEXT***
[BLACK & WHITE REFERENCE IMAGE ATTACHED]
Analyze the attached reference image carefully. This is a black and white (or sepia) photograph that needs to be colorized realistically.

***TASK***
Add realistic colors to this black and white reference image.

***INPUT DATA***
- Era/Period: {{era}}
- Color style: {{color_style}}
- Skin tone: {{skin_tone}}
- Special specific reqs: {{special}}

***INSTRUCTIONS***
1. **Context Analysis:** Infer appropriate colors based on the era ({{era}}) and scene context.
2. **People:** Apply natural {{skin_tone}} skin tones, realistic hair and eye colors.
3. **Objects/Clothing:** Use historically accurate colors for the period.
4. **Style:** Apply {{color_style}} color palette.
5. **Quality:** Preserve all details, textures, and shading. Ensure smooth color transitions.
6. **Goal:** The result should look like it was originally shot in color.`,
        variables: [
            {
                key: 'era',
                label: 'Thời kỳ/Năm',
                labelEn: 'Era/Period',
                type: 'select',
                options: [
                    { value: '1900s', label: '1900s', labelEn: '1900s' },
                    { value: '1920s', label: '1920s', labelEn: '1920s' },
                    { value: '1940s', label: '1940s', labelEn: '1940s' },
                    { value: '1960s', label: '1960s', labelEn: '1960s' },
                    { value: '1980s', label: '1980s', labelEn: '1980s' },
                    { value: 'unknown', label: 'Không rõ', labelEn: 'Unknown' }
                ],
                default: 'unknown'
            },
            {
                key: 'color_style',
                label: 'Phong cách màu',
                labelEn: 'Color Style',
                type: 'select',
                options: [
                    { value: 'realistic', label: 'Thực tế', labelEn: 'Realistic' },
                    { value: 'vibrant', label: 'Rực rỡ', labelEn: 'Vibrant' },
                    { value: 'vintage', label: 'Vintage', labelEn: 'Vintage' },
                    { value: 'muted', label: 'Nhẹ nhàng', labelEn: 'Muted' }
                ],
                default: 'realistic'
            },
            {
                key: 'skin_tone',
                label: 'Tông da',
                labelEn: 'Skin Tone',
                type: 'select',
                options: [
                    { value: 'auto', label: 'Tự động', labelEn: 'Auto detect' },
                    { value: 'fair', label: 'Sáng', labelEn: 'Fair' },
                    { value: 'medium', label: 'Trung bình', labelEn: 'Medium' },
                    { value: 'dark', label: 'Tối', labelEn: 'Dark' }
                ],
                default: 'auto'
            },
            {
                key: 'special',
                label: 'Yêu cầu màu cụ thể',
                labelEn: 'Specific Color Requests',
                type: 'text',
                placeholder: 'VD: Áo màu xanh navy, nền cỏ xanh, xe màu đỏ...',
                placeholderEn: 'E.g.: Navy blue shirt, green grass, red car...'
            }
        ]
    },

    {
        id: 'food-infographic',
        title: 'Thiết kế Infographic Thực phẩm',
        titleEn: 'Food Infographic Design',
        icon: 'restaurant_menu',
        category: TaskType.IMAGE,
        description: 'Tạo infographic thực phẩm cao cấp',
        descriptionEn: 'Create high-end food infographic',
        template: `***CONTEXT***
Modern, high-end infographic design about [{{food_item}}], clean, bright, and premium style, similar to infographics for high-end food/beverages.

***TASK***
Create a comprehensive culinary infographic for {{food_item}}.

***INPUT DATA***
- Food Name: {{food_item}}
- Focus Components: {{components}}
- Background Color: {{bg_color}}

***VISUAL STYLE***
- **Center Subject**: A [{{food_item}}] is placed in the center of the frame.
  - Beautiful 3/4 or angled view.
  - Natural, appealing shape.
  - Fresh, clean, and slightly glossy surface, giving a delicious and high-end feel.
  - Soft studio lighting with subtle shadows.
- **Background**: {{bg_color}}.
- **Internal Structure**: Constituent parts are shown semi-transparently or visually separated, clear, friendly – not gruesome, educational and culinary, not anatomical or medical.

***INFOGRAPHIC LAYOUT***
- **Indicators**: Each component of {{food_item}} is clearly indicated by thin, neat arrows and modern, rounded-corner cards with small, minimalist icons.
- **Layout**: Balanced, easy-to-read, uncluttered layout.
- **Classification System**:
  - 🟢 **DELICIOUS – RECOMMENDED**: [Short Description] – [Nutritional Value]
  - 🟡 **EDIBLE – SHOULD BE LIMITED**: [Reasons to Limit] – [Precautions]
  - 🔴 **SHOULD NOT BE USED**: [Reasons] – [Avoid Recommend]
- **Typography**: Modern sans-serif font. Clear hierarchy (Large Title > Medium Content). No cluttered text.
- **Main Title**: "{{food_item}} – WHICH PARTS ARE DELICIOUS & SHOULD YOU USE?"

***MANDATORY NOTE***
- **Nội dung chữ thể hiện trên infographic thể hiện bằng tiếng Việt có dấu, đúng chính tả.**

***NEGATIVE PROMPT***
(explicit text, graphic text, heavy medical anatomy, hand-drawn illustrations, children's cartoons, harsh colors, cluttered layout, small and hard-to-read text, bad fonts, watermarks, unnecessary logos)`,
        variables: [
            {
                key: 'food_item',
                label: 'Tên thực phẩm',
                labelEn: 'Food Name',
                type: 'text',
                placeholder: 'VD: Bò bít tết, Cá hồi...',
                placeholderEn: 'E.g.: Steak, Salmon...'
            },
            {
                key: 'components',
                label: 'Các phần/thành phần',
                labelEn: 'Components/Ingredients',
                type: 'textarea',
                placeholder: 'VD: Thăn lưng, thăn nội, nạm...',
                placeholderEn: 'E.g.: Ribeye, Tenderloin, Brisket...'
            },
            {
                key: 'bg_color',
                label: 'Màu nền',
                labelEn: 'Background Color',
                type: 'select',
                options: [
                    { value: 'White or very light gray', label: 'Trắng/Xám nhạt', labelEn: 'White/Light Gray' },
                    { value: 'Dark slate', label: 'Xám đậm', labelEn: 'Dark Slate' },
                    { value: 'Warm beige', label: 'Be ấm', labelEn: 'Warm Beige' }
                ],
                default: 'White or very light gray'
            }
        ]
    },

    // ========== VIDEO (2) ==========
    {
        id: 'time-lapse',
        title: 'Tạo video Time Lapse',
        titleEn: 'Time Lapse Video',
        icon: 'timelapse',
        category: TaskType.VIDEO,
        description: 'Tạo video time lapse từ ảnh hoặc mô tả',
        descriptionEn: 'Create time lapse video from image or description',
        template: `***CONTEXT***
[OPTIONAL: STARTING FRAME IMAGE ATTACHED]
If a reference image is attached, use it as the starting frame. Otherwise, create based on description.

***TASK***
Create a time lapse video of: {{subject}}

***INPUT DATA***
- Duration: {{duration}}
- Speed: {{speed}}
- Transition: {{transition}}
- Style: {{style}}
- Camera: {{camera}}

***INSTRUCTIONS***
1. If reference image provided: Start from that exact scene and animate time passing
2. Show natural progression of time (day to night, growth, movement of clouds/shadows, etc.)
3. Maintain consistent perspective throughout
4. Apply {{style}} visual style`,
        variables: [
            {
                key: 'subject',
                label: 'Chủ đề time lapse',
                labelEn: 'Time Lapse Subject',
                type: 'textarea',
                placeholder: 'VD: Mặt trời mọc trên thành phố, hoa nở, xây dựng tòa nhà...',
                placeholderEn: 'E.g.: Sunrise over city, flower blooming, building construction...'
            },
            {
                key: 'duration',
                label: 'Độ dài video',
                labelEn: 'Video Duration',
                type: 'select',
                options: [
                    { value: '5s', label: '5 giây', labelEn: '5 seconds' },
                    { value: '10s', label: '10 giây', labelEn: '10 seconds' },
                    { value: '15s', label: '15 giây', labelEn: '15 seconds' },
                    { value: '30s', label: '30 giây', labelEn: '30 seconds' }
                ],
                default: '10s'
            },
            {
                key: 'speed',
                label: 'Tốc độ',
                labelEn: 'Speed',
                type: 'select',
                options: [
                    { value: 'slow', label: 'Chậm', labelEn: 'Slow' },
                    { value: 'medium', label: 'Vừa', labelEn: 'Medium' },
                    { value: 'fast', label: 'Nhanh', labelEn: 'Fast' },
                    { value: 'hyperlapse', label: 'Hyperlapse', labelEn: 'Hyperlapse' }
                ],
                default: 'medium'
            },
            {
                key: 'transition',
                label: 'Chuyển cảnh',
                labelEn: 'Transition',
                type: 'select',
                options: [
                    { value: 'smooth', label: 'Mượt mà', labelEn: 'Smooth' },
                    { value: 'fade', label: 'Fade', labelEn: 'Fade' },
                    { value: 'none', label: 'Không', labelEn: 'None' }
                ],
                default: 'smooth'
            },
            {
                key: 'style',
                label: 'Phong cách',
                labelEn: 'Style',
                type: 'select',
                options: [
                    { value: 'cinematic', label: 'Cinematic', labelEn: 'Cinematic' },
                    { value: 'documentary', label: 'Documentary', labelEn: 'Documentary' },
                    { value: 'artistic', label: 'Nghệ thuật', labelEn: 'Artistic' }
                ],
                default: 'cinematic'
            },
            {
                key: 'camera',
                label: 'Camera',
                labelEn: 'Camera Movement',
                type: 'select',
                options: [
                    { value: 'static', label: 'Cố định', labelEn: 'Static' },
                    { value: 'slow_pan', label: 'Pan chậm', labelEn: 'Slow pan' },
                    { value: 'slow_zoom', label: 'Zoom chậm', labelEn: 'Slow zoom' }
                ],
                default: 'static'
            }
        ]
    },
    {
        id: 'loop-video',
        title: 'Tạo video Loop',
        titleEn: 'Loop Video Creator',
        icon: 'loop',
        category: TaskType.VIDEO,
        description: 'Tạo video loop liền mạch',
        descriptionEn: 'Create seamless looping video',
        template: `***CONTEXT***
[OPTIONAL: SOURCE IMAGE ATTACHED]
If reference attached, animate the scene. Otherwise, create from description.

***TASK***
Create a seamless looping video of: {{subject}}

***INPUT DATA***
- Loop duration: {{duration}}
- Loop type: {{loop_type}}
- Motion intensity: {{motion}}
- Style: {{style}}

***INSTRUCTIONS***
1. **Reference:** If image provided, animate elements within that exact scene.
2. **Seamlessness:** Ensure end frame transitions perfectly to start frame.
3. **Motion:** Apply subtle, natural motion appropriate for the subject.
4. **Consistency:** Maintain consistent lighting throughout the loop.`,
        variables: [
            {
                key: 'subject',
                label: 'Nội dung loop',
                labelEn: 'Loop Content',
                type: 'textarea',
                placeholder: 'VD: Lửa cháy, nước chảy, mây trôi, người đi bộ...',
                placeholderEn: 'E.g.: Fire burning, water flowing, clouds moving, walking person...'
            },
            {
                key: 'duration',
                label: 'Độ dài 1 vòng',
                labelEn: 'Single Loop Duration',
                type: 'select',
                options: [
                    { value: '2s', label: '2 giây', labelEn: '2 seconds' },
                    { value: '3s', label: '3 giây', labelEn: '3 seconds' },
                    { value: '5s', label: '5 giây', labelEn: '5 seconds' }
                ],
                default: '3s'
            },
            {
                key: 'loop_type',
                label: 'Kiểu loop',
                labelEn: 'Loop Type',
                type: 'select',
                options: [
                    { value: 'forward', label: 'Tiến liên tục', labelEn: 'Forward continuous' },
                    { value: 'ping_pong', label: 'Tiến - Lùi', labelEn: 'Ping pong' },
                    { value: 'crossfade', label: 'Crossfade', labelEn: 'Crossfade' }
                ],
                default: 'forward'
            },
            {
                key: 'motion',
                label: 'Chuyển động',
                labelEn: 'Motion',
                type: 'select',
                options: [
                    { value: 'subtle', label: 'Tinh tế', labelEn: 'Subtle' },
                    { value: 'medium', label: 'Vừa phải', labelEn: 'Medium' },
                    { value: 'dynamic', label: 'Năng động', labelEn: 'Dynamic' }
                ],
                default: 'medium'
            },
            {
                key: 'style',
                label: 'Phong cách',
                labelEn: 'Style',
                type: 'select',
                options: [
                    { value: 'realistic', label: 'Thực tế', labelEn: 'Realistic' },
                    { value: 'cinemagraph', label: 'Cinemagraph', labelEn: 'Cinemagraph' },
                    { value: 'animated', label: 'Hoạt hình', labelEn: 'Animated' }
                ],
                default: 'cinemagraph'
            }
        ]
    },

    // ========== WRITING (3) ==========
    {
        id: 'rewrite-tone',
        title: 'Viết lại theo tone',
        titleEn: 'Rewrite by Tone',
        icon: 'edit_note',
        category: TaskType.WRITING,
        description: 'Viết lại văn bản theo giọng văn khác',
        descriptionEn: 'Rewrite text in a different tone',
        template: `***TASK***
Rewrite the following text in a {{tone}} tone.

***INPUT DATA***
"""
{{original_text}}
"""

***REQUIREMENTS***
- Target audience: {{audience}}
- Output language: {{output_language}}
- Length: {{length_preference}}

***INSTRUCTIONS***
1. Keep the core message intact.
2. Adjust vocabulary and sentence structure to match the {{tone}} tone.
3. Ensure the text appeals to {{audience}}.`,
        variables: [
            {
                key: 'original_text',
                label: 'Văn bản gốc',
                labelEn: 'Original Text',
                type: 'textarea',
                placeholder: 'Dán văn bản cần viết lại vào đây...',
                placeholderEn: 'Paste the text you want to rewrite...'
            },
            {
                key: 'tone',
                label: 'Giọng văn mới',
                labelEn: 'New Tone',
                type: 'select',
                options: [
                    { value: 'professional', label: 'Chuyên nghiệp', labelEn: 'Professional' },
                    { value: 'casual', label: 'Thân mật', labelEn: 'Casual' },
                    { value: 'friendly', label: 'Thân thiện', labelEn: 'Friendly' },
                    { value: 'formal', label: 'Trang trọng', labelEn: 'Formal' },
                    { value: 'humorous', label: 'Hài hước', labelEn: 'Humorous' },
                    { value: 'persuasive', label: 'Thuyết phục', labelEn: 'Persuasive' }
                ],
                default: 'professional'
            },
            {
                key: 'audience',
                label: 'Đối tượng đọc',
                labelEn: 'Target Audience',
                type: 'select',
                options: [
                    { value: 'general', label: 'Chung', labelEn: 'General' },
                    { value: 'business', label: 'Doanh nghiệp', labelEn: 'Business' },
                    { value: 'students', label: 'Sinh viên', labelEn: 'Students' },
                    { value: 'experts', label: 'Chuyên gia', labelEn: 'Experts' }
                ],
                default: 'general'
            },
            {
                key: 'output_language',
                label: 'Ngôn ngữ đầu ra',
                labelEn: 'Output Language',
                type: 'select',
                options: [
                    { value: 'same', label: 'Giữ nguyên', labelEn: 'Keep same' },
                    { value: 'vietnamese', label: 'Tiếng Việt', labelEn: 'Vietnamese' },
                    { value: 'english', label: 'English', labelEn: 'English' }
                ],
                default: 'same'
            },
            {
                key: 'length_preference',
                label: 'Độ dài',
                labelEn: 'Length Preference',
                type: 'select',
                options: [
                    { value: 'shorter', label: 'Ngắn hơn', labelEn: 'Shorter' },
                    { value: 'same', label: 'Giữ nguyên', labelEn: 'Same length' },
                    { value: 'longer', label: 'Dài hơn', labelEn: 'Longer' }
                ],
                default: 'same'
            }
        ]
    },
    {
        id: 'summarize-text',
        title: 'Tóm tắt văn bản',
        titleEn: 'Summarize Text',
        icon: 'summarize',
        category: TaskType.WRITING,
        description: 'Tóm tắt nội dung văn bản dài',
        descriptionEn: 'Summarize long text content',
        template: `***TASK***
Summarize the following text.

***INPUT DATA***
"""
{{original_text}}
"""

***REQUIREMENTS***
- Length: {{summary_length}}
- Format: {{format}}
- Focus on: {{focus}}
- Output language: {{output_language}}

***INSTRUCTIONS***
1. Extract the most important information relating to {{focus}}.
2. Eliminate redundant or trivial details.
3. Present the summary clearly in {{format}} format.`,
        variables: [
            {
                key: 'original_text',
                label: 'Văn bản cần tóm tắt',
                labelEn: 'Text to Summarize',
                type: 'textarea',
                placeholder: 'Dán văn bản dài vào đây...',
                placeholderEn: 'Paste the long text here...'
            },
            {
                key: 'summary_length',
                label: 'Độ dài tóm tắt',
                labelEn: 'Summary Length',
                type: 'select',
                options: [
                    { value: '1-2 sentences', label: '1-2 câu', labelEn: '1-2 sentences' },
                    { value: '1 paragraph', label: '1 đoạn văn', labelEn: '1 paragraph' },
                    { value: '3-5 bullet points', label: '3-5 gạch đầu dòng', labelEn: '3-5 bullet points' },
                    { value: '10% of original', label: '10% độ dài gốc', labelEn: '10% of original' }
                ],
                default: '1 paragraph'
            },
            {
                key: 'format',
                label: 'Định dạng',
                labelEn: 'Format',
                type: 'select',
                options: [
                    { value: 'paragraph', label: 'Đoạn văn', labelEn: 'Paragraph' },
                    { value: 'bullets', label: 'Gạch đầu dòng', labelEn: 'Bullet points' },
                    { value: 'numbered', label: 'Đánh số', labelEn: 'Numbered list' }
                ],
                default: 'paragraph'
            },
            {
                key: 'focus',
                label: 'Tập trung vào',
                labelEn: 'Focus on',
                type: 'select',
                options: [
                    { value: 'main_ideas', label: 'Ý chính', labelEn: 'Main ideas' },
                    { value: 'key_facts', label: 'Sự kiện quan trọng', labelEn: 'Key facts' },
                    { value: 'conclusions', label: 'Kết luận', labelEn: 'Conclusions' },
                    { value: 'action_items', label: 'Hành động cần làm', labelEn: 'Action items' }
                ],
                default: 'main_ideas'
            },
            {
                key: 'output_language',
                label: 'Ngôn ngữ đầu ra',
                labelEn: 'Output Language',
                type: 'select',
                options: [
                    { value: 'same', label: 'Giữ nguyên', labelEn: 'Keep same' },
                    { value: 'vietnamese', label: 'Tiếng Việt', labelEn: 'Vietnamese' },
                    { value: 'english', label: 'English', labelEn: 'English' }
                ],
                default: 'same'
            }
        ]
    },
    {
        id: 'email-composer',
        title: 'Soạn email theo mục tiêu',
        titleEn: 'Email Composer',
        icon: 'mail',
        category: TaskType.WRITING,
        description: 'Tạo prompt để viết email chuyên nghiệp',
        descriptionEn: 'Create prompt for professional emails',
        template: `***TASK***
Write a professional email based on the following details.

***INPUT DATA***
- Purpose: {{purpose}}
- Recipient: {{recipient}}
- Key message: {{key_message}}
- Tone: {{tone}}
- Call to action: {{cta}}
- Language: {{language}}
- Additional context: {{context}}

***INSTRUCTIONS***
1. Use a clear and concise subject line (if applicable).
2. Maintain a {{tone}} tone appropriate for {{recipient}}.
3. Clearly state the {{purpose}} and {{key_message}}.
4. End with a clear call to action: {{cta}}.
5. Ensure professional formatting and signature.`,
        variables: [
            {
                key: 'purpose',
                label: 'Mục đích email',
                labelEn: 'Email Purpose',
                type: 'select',
                options: [
                    { value: 'request', label: 'Yêu cầu/Đề nghị', labelEn: 'Request' },
                    { value: 'follow_up', label: 'Theo dõi/Nhắc nhở', labelEn: 'Follow up' },
                    { value: 'introduction', label: 'Giới thiệu', labelEn: 'Introduction' },
                    { value: 'thank_you', label: 'Cảm ơn', labelEn: 'Thank you' },
                    { value: 'apology', label: 'Xin lỗi', labelEn: 'Apology' },
                    { value: 'announcement', label: 'Thông báo', labelEn: 'Announcement' },
                    { value: 'proposal', label: 'Đề xuất', labelEn: 'Proposal' }
                ],
                default: 'request'
            },
            {
                key: 'recipient',
                label: 'Người nhận',
                labelEn: 'Recipient',
                type: 'select',
                options: [
                    { value: 'boss', label: 'Sếp/Quản lý', labelEn: 'Boss/Manager' },
                    { value: 'colleague', label: 'Đồng nghiệp', labelEn: 'Colleague' },
                    { value: 'client', label: 'Khách hàng', labelEn: 'Client' },
                    { value: 'partner', label: 'Đối tác', labelEn: 'Partner' },
                    { value: 'hr', label: 'HR/Nhân sự', labelEn: 'HR' },
                    { value: 'team', label: 'Cả nhóm', labelEn: 'Team' }
                ],
                default: 'colleague'
            },
            {
                key: 'key_message',
                label: 'Nội dung chính',
                labelEn: 'Key Message',
                type: 'textarea',
                placeholder: 'VD: Xin nghỉ phép 3 ngày từ thứ 2 tuần sau...',
                placeholderEn: 'E.g.: Request 3 days leave starting next Monday...'
            },
            {
                key: 'tone',
                label: 'Giọng văn',
                labelEn: 'Tone',
                type: 'select',
                options: [
                    { value: 'formal', label: 'Trang trọng', labelEn: 'Formal' },
                    { value: 'professional', label: 'Chuyên nghiệp', labelEn: 'Professional' },
                    { value: 'friendly', label: 'Thân thiện', labelEn: 'Friendly' },
                    { value: 'urgent', label: 'Khẩn cấp', labelEn: 'Urgent' }
                ],
                default: 'professional'
            },
            {
                key: 'cta',
                label: 'Kêu gọi hành động',
                labelEn: 'Call to Action',
                type: 'select',
                options: [
                    { value: 'reply', label: 'Phản hồi', labelEn: 'Reply' },
                    { value: 'approve', label: 'Phê duyệt', labelEn: 'Approve' },
                    { value: 'schedule_meeting', label: 'Đặt lịch họp', labelEn: 'Schedule meeting' },
                    { value: 'review', label: 'Xem xét', labelEn: 'Review' },
                    { value: 'confirm', label: 'Xác nhận', labelEn: 'Confirm' },
                    { value: 'none', label: 'Không có', labelEn: 'None' }
                ],
                default: 'reply'
            },
            {
                key: 'language',
                label: 'Ngôn ngữ',
                labelEn: 'Language',
                type: 'select',
                options: [
                    { value: 'vietnamese', label: 'Tiếng Việt', labelEn: 'Vietnamese' },
                    { value: 'english', label: 'English', labelEn: 'English' }
                ],
                default: 'vietnamese'
            },
            {
                key: 'context',
                label: 'Ngữ cảnh bổ sung',
                labelEn: 'Additional Context',
                type: 'textarea',
                placeholder: 'Thông tin thêm nếu cần...',
                placeholderEn: 'Additional information if needed...'
            }
        ]
    },
    // --- MARKETING ---
    {
        id: 'viral-trends-hunter',
        title: 'Thợ săn Trend Viral',
        titleEn: 'Viral Trends Hunter',
        icon: 'trending_up',
        category: TaskType.MARKETING,
        description: 'Tìm kiếm và phân tích xu hướng viral mới nhất',
        descriptionEn: 'Discover and analyze latest viral trends',
        template: `***ROLE & CONTEXT***
You are a world-class Trend Analyst and Content Strategist. Your task is to research and synthesize rising trends in the {{niche}} niche on {{platform}}.

***RESEARCH CRITERIA***
- Timeframe: {{timeframe}}
- Content Type: {{content_type}}
- Signals: High views/engagement, new hashtags, active debates, fresh formats.

***OUTPUT FORMAT***
Return a detailed report with the following sections:

1. **🔥 TREND OVERVIEW**
   - Top 3-5 hottest trends.
   - Brief description and psychological hooks for each.

2. **🕵️ DEEP DIVE (Best Trend)**
   - **Viral Structure:** Hook -> Body -> CTA analysis.
   - **Keywords & Hashtags:** Algorithmic favorites.
   - **Audio/Visual:** Trending sounds or editing styles.

3. **🚀 ACTION PLAN**
   - **Content Ideas:** 3 specific ideas to ride this trend in {{niche}}.
   - **Titles:** 5 clickable titles.
   - **Avoid:** Common pitfalls.

***NOTE***
Ensure information is up-to-date and highly actionable.`,
        variables: [
            {
                key: 'niche',
                label: 'Lĩnh vực / Ngách',
                labelEn: 'Niche / Industry',
                type: 'text',
                placeholder: 'VD: Thời trang, Crypto, AI, Review đồ ăn...',
                placeholderEn: 'e.g., Fashion, Crypto, AI, Food Review...'
            },
            {
                key: 'platform',
                label: 'Nền tảng mục tiêu',
                labelEn: 'Target Platform',
                type: 'select',
                options: [
                    { value: 'tiktok', label: 'TikTok', labelEn: 'TikTok' },
                    { value: 'youtube_shorts', label: 'YouTube Shorts', labelEn: 'YouTube Shorts' },
                    { value: 'facebook_reels', label: 'Facebook/Instagram Reels', labelEn: 'Facebook/Instagram Reels' },
                    { value: 'threads', label: 'Threads / Twitter', labelEn: 'Threads / Twitter' },
                    { value: 'linkedin', label: 'LinkedIn', labelEn: 'LinkedIn' },
                    { value: 'general_news', label: 'Tin tức tổng hợp', labelEn: 'General News' }
                ],
                default: 'tiktok'
            },
            {
                key: 'timeframe',
                label: 'Phạm vi thời gian',
                labelEn: 'Timeframe',
                type: 'select',
                options: [
                    { value: '24h', label: '24 giờ qua (Siêu nhanh)', labelEn: 'Last 24 hours' },
                    { value: 'this_week', label: 'Tuần này', labelEn: 'This Week' },
                    { value: 'this_month', label: 'Tháng này', labelEn: 'This Month' }
                ],
                default: 'this_week'
            },
            {
                key: 'content_type',
                label: 'Dạng nội dung',
                labelEn: 'Content Type',
                type: 'select',
                options: [
                    { value: 'short_video', label: 'Video ngắn (Short form)', labelEn: 'Short Video' },
                    { value: 'long_video', label: 'Video dài', labelEn: 'Long-form Video' },
                    { value: 'article', label: 'Bài viết / Blog', labelEn: 'Article / Blog' },
                    { value: 'meme', label: 'Meme / Ảnh chế', labelEn: 'Meme' }
                ],
                default: 'short_video'
            }
        ]
    },
    {
        id: 'cold-email-outreach',
        title: 'Cold Email Chào Hàng',
        titleEn: 'Cold Email Outreach',
        icon: 'mail',
        category: TaskType.MARKETING,
        description: 'Viết email giới thiệu dịch vụ chuyên nghiệp',
        descriptionEn: 'Write professional service introduction emails',
        template: `***ROLE & CONTEXT***
You are a professional B2B Email Marketing Copywriter. Write a cold email to introduce a product/service to a potential client.

***INPUT DATA***
- Product/Service: {{product_name}}
- Target Audience: {{target_audience}}
- Value Proposition: {{value_prop}}
- Goal: {{goal}}
- Tone: {{tone}}

***STRUCTURE REQUIREMENTS (PAS or AIDA)***
1. **Subject Line:** 3 options (short, curiosity-inducing, high open rate).
2. **Greeting:** Personalized.
3. **Hook:** Address pain point or interesting fact.
4. **Body:**
   - Introduce {{product_name}} as the solution.
   - Highlight Benefits (not just Features): {{value_prop}}.
   - Brief Social Proof (if applicable).
5. **Call to Action (CTA):** Clear and simple ({{goal}}).
6. **Signature:** Professional.

***IMPORTANT NOTES***
- Keep it concise (under 150 words).
- Optimize for mobile reading.
- Avoid jargon or over-promising.`,
        variables: [
            {
                key: 'product_name',
                label: 'Sản phẩm / Dịch vụ',
                labelEn: 'Product / Service',
                type: 'text',
                placeholder: 'VD: Phần mềm quản lý kho, Dịch vụ thiết kế web...',
                placeholderEn: 'e.g., Inventory software, Web design service...'
            },
            {
                key: 'target_audience',
                label: 'Khách hàng mục tiêu',
                labelEn: 'Target Audience',
                type: 'text',
                placeholder: 'VD: Chủ doanh nghiệp SMEs, Giám đốc Marketing...',
                placeholderEn: 'e.g., SME Owners, Marketing Directors...'
            },
            {
                key: 'value_prop',
                label: 'Giá trị cốt lõi / Lợi ích',
                labelEn: 'Value Proposition',
                type: 'textarea',
                placeholder: 'Sản phẩm giúp gì cho họ? (VD: Tiết kiệm 50% thời gian...)',
                placeholderEn: 'What benefit does it provide?'
            },
            {
                key: 'goal',
                label: 'Mục tiêu (CTA)',
                labelEn: 'Goal (CTA)',
                type: 'select',
                options: [
                    { value: 'reply', label: 'Mong phản hồi', labelEn: 'Get a reply' },
                    { value: 'meeting', label: 'Đặt lịch demo/họp', labelEn: 'Book a meeting' },
                    { value: 'click', label: 'Click xem link', labelEn: 'Click a link' }
                ],
                default: 'meeting'
            },
            {
                key: 'tone',
                label: 'Giọng văn',
                labelEn: 'Tone',
                type: 'select',
                options: [
                    { value: 'professional', label: 'Chuyên nghiệp', labelEn: 'Professional' },
                    { value: 'friendly', label: 'Thân thiện, cởi mở', labelEn: 'Friendly' },
                    { value: 'direct', label: 'Thẳng thắn, đi vào vấn đề', labelEn: 'Direct' }
                ],
                default: 'professional'
            }
        ]
    },
    {
        id: 'objection-handler',
        title: 'Xử lý từ chối',
        titleEn: 'Objection Handler',
        icon: 'support_agent',
        category: TaskType.MARKETING,
        description: 'Gợi ý kịch bản trả lời khi khách hàng từ chối',
        descriptionEn: 'Scripts to handle customer objections',
        template: `***ROLE & CONTEXT***
You are a Sales Master and Negotiation Expert. Handle this customer objection skillfully to turn the situation around or maintain the relationship.

***INPUT DATA***
- Product/Service: {{product}}
- Customer Objection: "{{objection}}"
- Customer Type: {{customer_type}}

***RESPONSE SCENARIOS***
Provide 3 different scripts:

1. **Empathy & Probe:** Acknowledge valid points, ask probing questions to find root cause.
2. **Reframing Value:** Shift focus from "Price" to "Value" or "Opportunity Cost".
3. **Down-sell / Pivot:** Suggest a lighter option or ask to stay in touch.

***PRINCIPLES***
- Respectful and positive attitude.
- No pressure.
- Goal: Help the customer make the best decision for them.`,
        variables: [
            {
                key: 'product',
                label: 'Sản phẩm đang bán',
                labelEn: 'Product being sold',
                type: 'text',
                placeholder: 'VD: Bất động sản, Khóa học tiếng Anh...',
                placeholderEn: 'e.g., Real Estate, English Course...'
            },
            {
                key: 'objection',
                label: 'Lời từ chối cụ thể',
                labelEn: 'The Objection',
                type: 'textarea',
                placeholder: 'VD: "Giá bên em đắt quá", "Chị cần hỏi ý kiến chồng"...',
                placeholderEn: 'e.g., "Too expensive", "I need to ask my partner"...'
            },
            {
                key: 'customer_type',
                label: 'Kiểu khách hàng',
                labelEn: 'Customer Type',
                type: 'select',
                options: [
                    { value: 'new_lead', label: 'Khách mới (Lạnh)', labelEn: 'Cold Lead' },
                    { value: 'warm_lead', label: 'Khách đang quan tâm', labelEn: 'Warm Lead' },
                    { value: 'difficult', label: 'Khách khó tính', labelEn: 'Difficult Customer' }
                ],
                default: 'warm_lead'
            }
        ]
    },
    {
        id: 'product-launch-plan',
        title: 'Kế hoạch ra mắt SP',
        titleEn: 'Product Launch Plan',
        icon: 'rocket_launch',
        category: TaskType.MARKETING,
        description: 'Lập kế hoạch Marketing ra mắt sản phẩm mới',
        descriptionEn: 'Marketing plan for new product launch',
        template: `***ROLE & CONTEXT***
You are a seasoned CMO. Create a detailed Product Launch Plan for the following product.

***INPUT DATA***
- Product Name: {{product_name}}
- Industry: {{industry}}
- Budget: {{budget}}
- Channels: {{channels}}

***PLAN STRUCTURE***
Create a plan covering Pre-launch, Launch, and Post-launch:

1. **QUICK ANALYSIS (SWOT)**
   - Key Strengths & Opportunities.

2. **PHASE 1: PRE-LAUNCH** (Goal: Curiosity & Leads)
   - Teasing strategy.
   - Specific activities (Minigame, Waitlist, Seeding...).

3. **PHASE 2: LAUNCH DAY** (Goal: Sales & Viral)
   - "Big Idea" for launch day.
   - Key activities in first 24h.
   - Launch Offer.

4. **PHASE 3: POST-LAUNCH** (Goal: Review & Retention)
   - Review/Feedback incentives.
   - Heat maintenance strategy.

5. **KEY KPIs**
   - Top 3-5 metrics to track.`,
        variables: [
            {
                key: 'product_name',
                label: 'Tên sản phẩm',
                labelEn: 'Product Name',
                type: 'text',
                placeholder: 'VD: Trà sữa giảm cân X...',
                placeholderEn: 'e.g., Weight loss tea X...'
            },
            {
                key: 'industry',
                label: 'Ngành hàng',
                labelEn: 'Industry',
                type: 'text',
                placeholder: 'VD: F&B, Công nghệ, Mỹ phẩm...',
                placeholderEn: 'e.g., F&B, Tech, Cosmetics...'
            },
            {
                key: 'channels',
                label: 'Kênh truyền thông',
                labelEn: 'Channels',
                type: 'textarea',
                placeholder: 'VD: TikTok, Facebook Ads, Booking KOLs...',
                placeholderEn: 'e.g., TikTok, FB Ads, KOLs...'
            },
            {
                key: 'budget',
                label: 'Quy mô ngân sách',
                labelEn: 'Budget Scale',
                type: 'select',
                options: [
                    { value: 'zero_budget', label: '0 đồng (Organic)', labelEn: 'Zero Budget (Organic)' },
                    { value: 'low', label: 'Thấp (Tiết kiệm)', labelEn: 'Low Budget' },
                    { value: 'medium', label: 'Trung bình', labelEn: 'Medium' },
                    { value: 'high', label: 'Cao (Phủ sóng)', labelEn: 'High Budget' }
                ],
                default: 'medium'
            }
        ]
    },
    {
        id: 'ad-poster-generator',
        title: 'Tạo Poster Quảng Cáo',
        titleEn: 'Ad Poster Generator',
        icon: 'campaign',
        category: TaskType.MARKETING,
        description: 'Tạo ảnh quảng cáo sản phẩm chuyên nghiệp',
        descriptionEn: 'Create professional product advertisement images',
        template: `***CONTEXT***
[PRODUCT IMAGE ATTACHED]
Based on the attached product image, create a professional studio-style product advertisement image.

***TASK***
Create a high-end commercial advertising image for the product.

***REQUIREMENTS***
1. **Subject:** The product must be central, prominent, clear, and not obscured.
2. **Lighting:** High-quality studio lighting, clean, elegant, and modern feel.
3. **Background:** {{background_desc}}
   - Must be impressive and have depth.
   - Directly related to the product's function/industry.
   - NO cluttered or generic backgrounds.
4. **Color Palette:** Harmonize with the product, creating trust and professionalism.
5. **Style:** {{style}}

***TECHNICAL SPECS***
- Aspect Ratio: {{aspect_ratio}}
- Resolution: 4K, high detail, sharp`,
        variables: [
            {
                key: 'background_desc',
                label: 'Mô tả nền',
                labelEn: 'Background Description',
                type: 'textarea',
                placeholder: 'VD: Nền studio tối giản, bục gỗ sang trọng, liên quan công năng...',
                placeholderEn: 'E.g., Minimalist studio, luxury wooden podium, related to function...',
                default: 'Impressive, deep, related to product function/industry'
            },
            {
                key: 'style',
                label: 'Phong cách',
                labelEn: 'Style',
                type: 'select',
                options: [
                    { value: 'modern_elegant', label: 'Hiện đại & Sang trọng', labelEn: 'Modern & Elegant' },
                    { value: 'vibrant_energetic', label: 'Rực rỡ & Năng động', labelEn: 'Vibrant & Energetic' },
                    { value: 'minimalist', label: 'Tối giản (Minimalist)', labelEn: 'Minimalist' },
                    { value: 'nature_organic', label: 'Thiên nhiên (Nature)', labelEn: 'Nature & Organic' }
                ],
                default: 'modern_elegant'
            },
            {
                key: 'aspect_ratio',
                label: 'Tỷ lệ khung hình',
                labelEn: 'Aspect Ratio',
                type: 'select',
                options: [
                    { value: '9:16', label: '9:16 (Story/TikTok)', labelEn: '9:16 (Vertical)' },
                    { value: '1:1', label: '1:1 (Instagram/Facebook)', labelEn: '1:1 (Square)' },
                    { value: '16:9', label: '16:9 (Youtube/Web)', labelEn: '16:9 (Landscape)' }
                ],
                default: '9:16'
            }
        ]
    },
    // --- DATA & INTELLIGENCE ---
    // --- DATA & INTELLIGENCE ---
    {
        id: 'fashion-trend-radar',
        title: 'Xu hướng Thời trang',
        titleEn: 'Fashion Trend Radar',
        icon: 'styler',
        category: TaskType.DATA,
        description: 'Cập nhật xu hướng thời trang mới nhất theo mùa/phong cách',
        descriptionEn: 'Update latest fashion trends by season/style',
        template: `***ROLE & CONTEXT***
Bạn là Giám đốc Sáng tạo (Creative Director) và Chuyên gia Dự báo Xu hướng (Trend Forecaster) hàng đầu thế giới với 20 năm kinh nghiệm tại các tạp chí danh tiếng như Vogue, Harper's Bazaar. Nhiệm vụ của bạn là cung cấp một bản báo cáo chuyên sâu và trực quan về xu hướng thời trang.

***INPUT DATA***
- **Phong cách/Chủ đề (Theme):** {{style}}
- **Mùa/Thời điểm (Season):** {{season}}
- **Đối tượng mục tiêu (Target Audience):** {{target}}

***INSTRUCTIONS***
Hãy thực hiện nghiên cứu và phân tích sâu sắc các yếu tố sau:
1.  **Vibe & Aesthetic (Cảm hứng chủ đạo):** Mô tả chi tiết không khí, cảm xúc và thông điệp của xu hướng này.
2.  **Color Palette (Bảng màu):** Liệt kê các mã màu (Hex/Pantone) và tên gọi trendy.
3.  **Key Items (Must-haves):** 5 món đồ không thể thiếu để định hình phong cách này.
4.  **Materials & Textures (Chất liệu):** Các loại vải và bề mặt vật liệu được ưa chuộng.
5.  **Brand & Influencers:** Các thương hiệu hoặc biểu tượng thời trang đang dẫn đầu xu hướng này.

***OUTPUT FORMAT***
Trình bày dưới dạng Markdown chuyên nghiệp, sử dụng bullet points rõ ràng. Ngôn ngữ thời thượng, sang trọng và đầy cảm hứng (Editor's Voice).`,
        variables: [
            {
                key: 'style',
                label: 'Phong cách',
                labelEn: 'Style',
                type: 'text',
                placeholder: 'VD: Streetwear, Minimalist, Y2K, Old Money...',
                placeholderEn: 'e.g., Streetwear, Minimalist, Old Money...'
            },
            {
                key: 'season',
                label: 'Mùa / Năm',
                labelEn: 'Season / Year',
                type: 'text',
                placeholder: 'VD: Thu Đông 2025, Xuân Hè...',
                placeholderEn: 'e.g., FW 2025, SS...'
            },
            {
                key: 'target',
                label: 'Đối tượng',
                labelEn: 'Target Audience',
                type: 'text',
                placeholder: 'VD: Gen Z nam, Phụ nữ công sở, Luxury shoppers...',
                placeholderEn: 'e.g., Gen Z men, Office women...'
            }
        ]
    },
    {
        id: 'highlight-news-express',
        title: 'Điểm tin nóng',
        titleEn: 'Highlight News Express',
        icon: 'newspaper',
        category: TaskType.DATA,
        description: 'Tổng hợp tin tức nổi bật trong ngày/tuần theo lĩnh vực',
        descriptionEn: 'Summarize highlight news of the day/week by sector',
        template: `***ROLE***
Bạn là một Biên tập viên tin tức kỳ cựu (Senior News Editor) của một hãng thông tấn lớn (như Reuters, Bloomberg). Bạn có khả năng lọc nhiễu thông tin và tóm tắt cốt lõi vấn đề một cách xuất sắc.

***TASK***
Quét toàn bộ không gian tin tức về chủ đề **{{topic}}** trong khoảng thời gian **{{timeframe}}** và chọn lọc ra Top 5-7 tin tức quan trọng nhất (High Impact News).

***ANALYSIS REQUIREMENTS***
Với mỗi tin tức, hãy thực hiện:
1.  **Headline:** Viết lại tiêu đề hấp dẫn, ngắn gọn (in đậm).
2.  **Summary:** Tóm tắt "What happened?" trong tối đa 2 câu súc tích.
3.  **Why It Matters (Insight):** Phân tích *Tại sao tin này lại quan trọng?* Nó ảnh hưởng đến ai/cái gì?
4.  **Source:** Ghi chú nguồn tin (nếu có thể suy luận hoặc giả định dựa trên dữ liệu training).

***OUTPUT GUIDELINES***
- Format: Markdown list.
- Tone: Khách quan, Chính xác, Ngắn gọn (Journalistic Style).
- Tuyệt đối không đưa tin fake hoặc tin đồn chưa kiểm chứng.`,
        variables: [
            {
                key: 'topic',
                label: 'Chủ đề tin tức',
                labelEn: 'News Topic',
                type: 'text',
                placeholder: 'VD: AI Technology, Geopolitics, Climate Change...',
                placeholderEn: 'e.g., Tech, Politics, Climate...'
            },
            {
                key: 'timeframe',
                label: 'Thời gian',
                labelEn: 'Timeframe',
                type: 'select',
                options: [
                    { value: 'today', label: 'Hôm nay (24h qua)', labelEn: 'Today (Past 24h)' },
                    { value: 'this_week', label: 'Tuần này', labelEn: 'This Week' },
                    { value: 'this_month', label: 'Tháng này', labelEn: 'This Month' }
                ],
                default: 'today'
            }
        ]
    },
    {
        id: 'finance-market-watch',
        title: 'Thị trường Tài chính',
        titleEn: 'Finance Market Watch',
        icon: 'attach_money',
        category: TaskType.DATA,
        description: 'Tổng quan thị trường tài chính, chứng khoán, tiền tệ',
        descriptionEn: 'Overview of financial markets, stocks, currencies',
        template: `***ROLE***
Bạn là Chuyên gia Phân tích Tài chính Cấp cao (Senior Financial Analyst) tại Phố Wall. Phong cách của bạn là dựa trên dữ liệu (Data-driven), sắc sảo và đi thẳng vào vấn đề.

***OBJECTIVE***
Cung cấp bản báo cáo nhanh (Flash Report) về tình hình thị trường **{{market}}** trong khung thời gian **{{timeframe}}**.

***REPORT STRUCTURE***
1.  **📊 Market Pulse (Nhịp đập thị trường):**
    - Trạng thái chung: Bullish 🐂, Bearish 🐻 hay Sideway 🦀?
    - Các chỉ số chính (Indices) biến động ra sao?

2.  **💰 Money Flow (Dòng tiền thông minh):**
    - Dòng tiền đang đổ vào nhóm ngành nào?
    - Nhóm nào đang bị bán tháo?

3.  **🌍 Macro Drivers (Vĩ mô tác động):**
    - Tin tức Lãi suất, Lạm phát, Chính sách vĩ mô nào đang chi phối tâm lý nhà đầu tư?

4.  **🔮 Expert Verdict (Nhận định):**
    - Dự báo xu hướng ngắn hạn tiếp theo.
    - Hành động khuyến nghị (Quan sát, Giải ngân hay Phòng thủ).

***OUTPUT FORMAT***
Sử dụng Markdown, Icon phù hợp để báo cáo sinh động. Số liệu phải rõ ràng.`,
        variables: [
            {
                key: 'market',
                label: 'Thị trường',
                labelEn: 'Market',
                type: 'text',
                placeholder: 'VD: VN-INDEX, US Stocks (S&P 500), Gold, Forex...',
                placeholderEn: 'e.g., VN-INDEX, S&P 500, Gold...'
            },
            {
                key: 'timeframe',
                label: 'Khung thời gian',
                labelEn: 'Timeframe',
                type: 'select',
                options: [
                    { value: 'daily', label: 'Phiên giao dịch hôm nay', labelEn: 'Current Session' },
                    { value: 'weekly', label: 'Tổng kết tuần', labelEn: 'Weekly Recap' }
                ],
                default: 'daily'
            }
        ]
    },
    {
        id: 'top-stock-opportunities',
        title: 'Cổ phiếu Triển vọng',
        titleEn: 'Top Stock Picks',
        icon: 'trending_up',
        category: TaskType.DATA,
        description: 'Gợi ý các mã cổ phiếu tiềm năng kèm phân tích',
        descriptionEn: 'Suggest potential stocks with analysis',
        template: `***ROLE***
Đóng vai một Quỹ đầu tư mạo hiểm (Venture Capital) hoặc Giám đốc Quỹ (Fund Manager) với khẩu vị rủi ro được tính toán kỹ lưỡng.

***MISSION***
Sàng lọc và đề xuất Top 3-5 cơ hội đầu tư hấp dẫn nhất trong lĩnh vực **{{sector}}** với tầm nhìn **{{horizon}}**.

***ANALYSIS FRAMEWORK (Cho mỗi mã cổ phiếu/tài sản)***
1.  **Ticker:** Mã cổ phiếu / Tên tài sản.
2.  **The "Moat" (Lợi thế cạnh tranh):** Điều gì làm công ty này đặc biệt?
3.  **Investment Thesis (Luận điểm đầu tư):** 3 lý do "Killer" khiến giá sẽ tăng (VD: Định giá rẻ P/E thấp, Tăng trưởng lợi nhuận đột biến, Game M&A...).
4.  **Risks (Rủi ro):** Rủi ro lớn nhất là gì? (Pháp lý, Tỷ giá, Cạnh tranh...).
5.  **Entry Zone:** Vùng giá khuyến nghị mua an toàn (Ước lượng).

***DISCLAIMER***
Bắt buộc kèm theo cảnh báo: "Dữ liệu chỉ mang tính chất tham khảo, không phải lời khuyên tài chính (NFA). Nhà đầu tư cần tự nghiên cứu (DYOR)."`,
        variables: [
            {
                key: 'sector',
                label: 'Ngành / Lĩnh vực',
                labelEn: 'Sector',
                type: 'text',
                placeholder: 'VD: Ngân hàng, Bất động sản KCN, Công nghệ (Tech)...',
                placeholderEn: 'e.g., Banking, Tech, Real Estate...'
            },
            {
                key: 'horizon',
                label: 'Tầm nhìn đầu tư',
                labelEn: 'Investment Horizon',
                type: 'select',
                options: [
                    { value: 'short', label: 'Ngắn hạn (Trading/Lướt sóng)', labelEn: 'Short-term (Trading)' },
                    { value: 'medium', label: 'Trung hạn (6 tháng - 1 năm)', labelEn: 'Medium-term' },
                    { value: 'long', label: 'Dài hạn (Tích sản)', labelEn: 'Long-term (Investing)' }
                ],
                default: 'medium'
            }
        ]
    },
    {
        id: 'global-economy-tracker',
        title: 'Kinh tế Vĩ mô TG',
        titleEn: 'Global Economy Tracker',
        icon: 'public',
        category: TaskType.DATA,
        description: 'Tổng hợp biến động kinh tế thế giới',
        descriptionEn: 'Track global economic fluctuations',
        template: `***ROLE***
Bạn là Chuyên gia Kinh tế Vĩ mô (Macroeconomist) làm việc cho World Bank hoặc IMF.

***TASK***
Phân tích bức tranh toàn cảnh kinh tế thế giới hiện tại và đánh giá tác động cụ thể (Impact Assessment) đến khu vực: **{{region}}**.

***KEY PILLARS (Các trụ cột phân tích)***
1.  **Central Banks (Chính sách tiền tệ):** Động thái của Fed (Mỹ), ECB (Âu), PBoC (Trung Quốc). Diều hâu (Hawkish) hay Bồ câu (Dovish)?
2.  **Geopolitics (Địa chính trị):** Các điểm nóng xung đột (Trung Đông, Nga-Ukraine, Biển Đông...) ảnh hưởng thế nào đến giá năng lượng và chuỗi cung ứng?
3.  **Trade & Forex (Thương mại & Tỷ giá):** Dòng chảy thương mại và sức mạnh đồng USD (DXY).
4.  **Global Forecast:** Kịch bản kinh tế sắp tới: Suy thoái (Recession), Hạ cánh mềm (Soft Landing) hay Tăng trưởng nóng?

***OUTPUT FORMAT***
Báo cáo chiến lược, chia theo từng mục rõ ràng.`,
        variables: [
            {
                key: 'region',
                label: 'Khu vực chịu tác động',
                labelEn: 'Impacted Region',
                type: 'text',
                placeholder: 'VD: Kinh tế Việt Nam, Đông Nam Á (ASEAN), EU...',
                placeholderEn: 'e.g., Vietnam, ASEAN, EU...'
            }
        ]
    },
    {
        id: 'ai-trends-tools',
        title: 'Xu hướng & Tool AI',
        titleEn: 'AI Trends & Tools',
        icon: 'smart_toy',
        category: TaskType.DATA,
        description: 'Cập nhật tin tức và công cụ AI mới nhất',
        descriptionEn: 'Update latest AI news and tools',
        template: `***ROLE***
Bạn là AI Researcher và Tech Evangelist đam mê công nghệ. Bạn luôn cập nhật những thứ "bleeding-edge" nhất.

***MISSION***
Cung cấp bản tin cập nhật về thế giới AI dành cho những người làm trong lĩnh vực **{{job}}**.

***CONTENT SECTIONS***
1.  **🚨 Breaking News:** 1-2 tin tức chấn động nhất tuần qua trong giới AI (OpenAI, Google, Anthropic...).
2.  **🛠️ Tool of the Week:** Giới thiệu 3 công cụ AI mới thực sự hữu ích cho **{{job}}**.
    - *Tên tool:*
    - *Chức năng chính:*
    - *Tại sao nên dùng:*
3.  **🔥 GitHub/Open Source:** (Nếu có) Các repo hoặc model open-source đang trending trên HuggingFace/GitHub.
4.  **💡 Use Case Idea:** Một ý tưởng ứng dụng AI cụ thể để tối ưu công việc của **{{job}}**.

***TONE***
Hào hứng, hiện đại, nhiều thuật ngữ công nghệ chính xác (Tech-savvy).`,
        variables: [
            {
                key: 'job',
                label: 'Lĩnh vực áp dụng',
                labelEn: 'Field of Application',
                type: 'text',
                placeholder: 'VD: Developer, Marketing, Content Creator, Designer...',
                placeholderEn: 'e.g., Dev, Marketing, Designer...'
            }
        ]
    },
    {
        id: 'best-midjourney-prompts',
        title: 'Top Prompt Ảnh Viral',
        titleEn: 'Viral Image Prompts',
        icon: 'image',
        category: TaskType.DATA,
        description: 'Thống kê 10 cấu trúc prompt tạo ảnh đang hot',
        descriptionEn: 'Top 10 viral image generation prompts',
        template: `***ROLE***
Bạn là một AI Artist nổi tiếng và Prompt Engineer chuyên nghiệp. Bạn nắm rõ thuật toán của Midjourney, Stable Diffusion và Flux.

***TASK***
Tuyển chọn bộ sưu tập "Top Viral AI Art Prompts" theo phong cách **{{style}}**.

***DELIVERABLES***
Danh sách các Prompt (tiếng Anh) chất lượng cao, kèm phân tích kỹ thuật:

**Format cho mỗi item:**
> **1. [Tên Concept/Chủ đề]**
> * **Prompt:** \`[Copy đoạn prompt tiếng Anh chuẩn vào đây]\`
> * **Secret Sauce (Bí kíp):** Giải thích tại sao prompt này lại ra ảnh đẹp? (Phân tích về Lighting, Camera angles, Art style keywords, Rendering engines như Unreal Engine 5, Octane Render...).
> * **Tools suitable:** Midjourney v6 / Flux / SDXL...

***STYLE FOCUS:*** {{style}}`,
        variables: [
            {
                key: 'style',
                label: 'Phong cách ảnh',
                labelEn: 'Image Style',
                type: 'text',
                placeholder: 'VD: Cyberpunk, Cinematic Realistic, Ghibli Style, Product Photography...',
                placeholderEn: 'e.g., Cyberpunk, Cinematic, Product...'
            }
        ]
    },
    {
        id: 'competitor-spy',
        title: 'Soi Đối thủ (Spy)',
        titleEn: 'Competitor Intel',
        icon: 'visibility',
        category: TaskType.DATA,
        description: 'Phân tích hoạt động của đối thủ cạnh tranh',
        descriptionEn: 'Analyze competitor activities',
        template: `***ROLE***
Bạn là điệp viên tình báo doanh nghiệp (Corporate Spy / Competitive Intelligence Officer). Nhiệm vụ của bạn là "đọc vị" đối thủ.

***TARGET***
- **Thương hiệu của chúng ta:** {{my_brand}}
- **Đối thủ mục tiêu:** {{competitor}}

***DEEP DIVE ANALYSIS***
1.  **Marketing Moves:** Họ đang chạy chiến dịch gì? Kênh nào? Thông điệp chủ đạo (Key message) là gì?
2.  **Customer Sentiment:** "Lắng nghe xã hội" (Social Listening) - Khách hàng đang phàn nàn điều gì về họ? Họ đang được khen điều gì?
3.  **Product & Pricing:** Họ có tung ra tính năng mới hay thay đổi giá bán không? Chiến lược giá của họ là gì?
4.  **SWOT Quick Look:** Điểm mạnh (Strengths) và Điểm yếu (Weaknesses) cốt lõi của họ so với {{my_brand}}.
5.  **ATTACK STRATEGY:** Đề xuất 1 mũi nhọn để {{my_brand}} tấn công vào điểm yếu của đối thủ ngay lập tức.

***OUTPUT FORMAT***
Bảng so sánh hoặc Bullet points chi tiết. Trực diện, không vòng vo.`,
        variables: [
            {
                key: 'my_brand',
                label: 'Thương hiệu của bạn',
                labelEn: 'Your Brand',
                type: 'text',
                placeholder: 'VD: VinFast, The Coffee House, Techcombank...',
                placeholderEn: 'e.g., Your Brand Name...'
            },
            {
                key: 'competitor',
                label: 'Đối thủ cần soi',
                labelEn: 'Target Competitor',
                type: 'text',
                placeholder: 'VD: Tesla, Highlands Coffee, VPBank...',
                placeholderEn: 'e.g., Competitor Name...'
            }
        ]
    },
    {
        id: 'crypto-market-pulse',
        title: 'Thị trường Crypto',
        titleEn: 'Crypto Market Pulse',
        icon: 'currency_bitcoin',
        category: TaskType.DATA,
        description: 'Biến động thị trường tiền điện tử',
        descriptionEn: 'Cryptocurrency market fluctuations',
        template: `***ROLE***
Bạn là "KOL" (Key Opinion Leader) và Researcher lão làng trong thị trường Crypto (Tiền điện tử). Bạn hiểu rõ cả về Phân tích kỹ thuật (TA) và Phân tích cơ bản (FA).

***CONTEXT***
Thị trường Crypto biến động 24/7. Hãy cập nhật trạng thái mới nhất.
**Trọng tâm phân tích:** {{focus}}

***INSIGHT REPORT***
1.  **King & Queen (BTC/ETH):** Xu hướng giá hiện tại. Mốc hỗ trợ/kháng cự (Support/Resistance) quan trọng cần chú ý.
2.  **Market Narrative:** Dòng tiền đang kể câu chuyện gì? (AI, RWA, Gaming, Meme, Layer 2...?).
3.  **On-chain Signals:** (Giả lập phân tích on-chain) Có dấu hiệu gom hàng của Cá voi (Whales) hay đẩy lên sàn để xả không?
4.  **Risk Alert:** Cảnh báo các rủi ro (Hack, FUD, Unlock token...).

***TONE***
Crypto-native (sử dụng thuật ngữ ngành: FOMO, FUD, ATH, Dip, DCA...), ngắn gọn, tốc độ.`,
        variables: [
            {
                key: 'focus',
                label: 'Trọng tâm',
                labelEn: 'Focus',
                type: 'text',
                placeholder: 'VD: Memecoin Season, Ethereum ETF, Solana Ecosystem...',
                placeholderEn: 'e.g., Memecoins, ETF, Solana...'
            }
        ]
    },
    {
        id: 'real-estate-snapshot',
        title: 'Bất động sản',
        titleEn: 'Real Estate Snapshot',
        icon: 'apartment',
        category: TaskType.DATA,
        description: 'Thông tin thị trường bất động sản khu vực',
        descriptionEn: 'Real estate market insights',
        template: `***ROLE***
Bạn là Chuyên gia tư vấn và môi giới Bất động sản cấp cao (Senior Real Estate Consultant), am hiểu tường tận quy hoạch và giá cả khu vực **{{location}}**.

***ANALYSIS REQUEST***
Cung cấp bức tranh toàn cảnh về thị trường BĐS tại: **{{location}}**.

***KEY AREAS***
1.  **Price Trend (Biểu đồ giá):** Giá đang tăng, giảm hay đi ngang? (Đất nền, Chung cư, Nhà phố...).
2.  **Infrastructure (Hạ tầng):** "Đòn bẩy" hạ tầng nào đang hình thành? (Cầu, Đường vành đai, Metro, Khu công nghiệp...).
3.  **Supply & Demand (Cung Cầu):** Thanh khoản thị trường ra sao? Người mua thực hay đầu cơ?
4.  **Investment Advice:**
    - *Mua ở:* Khu vực nào tiềm năng nhất?
    - *Tránh xa:* Khu vực nào đang "ngáo giá"?

***OUTPUT FORMAT***
Báo cáo chuyên nghiệp, khách quan.`,
        variables: [
            {
                key: 'location',
                label: 'Khu vực',
                labelEn: 'Location',
                type: 'text',
                placeholder: 'VD: Đông Anh (Hà Nội), Quận 9 (TP.HCM), Đà Nẵng...',
                placeholderEn: 'e.g., Hanoi, HCMC, Da Nang...'
            }
        ]
    }
];

// Helper to get templates by category
export const getTemplatesByCategory = (category: TaskType): PromptTemplate[] => {
    return promptTemplates.filter(t => t.category === category);
};

// Helper to search templates
export const searchTemplates = (query: string): PromptTemplate[] => {
    const lowerQuery = query.toLowerCase();
    return promptTemplates.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.titleEn.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.descriptionEn.toLowerCase().includes(lowerQuery)
    );
};
