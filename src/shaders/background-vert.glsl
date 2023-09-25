#version 300 es
precision highp float; // add this line

layout(location = 0) in vec2 inPosition;  // Quad vertex positions
layout(location = 1) in vec2 inUV;       // Quad UV coordinates

out vec2 fs_UV;

void main()
{
    fs_UV = inUV;
    gl_Position = vec4(inPosition, 0.0, 1.0);
}
