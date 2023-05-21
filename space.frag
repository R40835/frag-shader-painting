//utility fuctions:
//2D noise
float N21(vec2 coord) {
    return fract(sin(coord.x*100.+coord.y*6574.)*5647.);
}

//perlin noise
float pn(vec2 coord) {
    
    //lc: local uv coordinates, id: grid cell location (origin of the grid)
    vec2 lc = smoothstep(0.,1.,fract(coord));
    vec2 id = floor(coord);
    
    lc = lc*lc*(3.-2.*lc);
    
    //top 
    float tl = N21(id+vec2(0,1));
    float tr = N21(id+vec2(1,1));
    
    float t = mix(tl, tr, lc.x);
    
    //bottom
    float bl = N21(id); 
    float br = N21(id+vec2(1,0));
    
    //mixing both values based on our location inside the box
    float b = mix(bl, br, lc.x);
    
    //interpolating between the top and the bottom
    return mix(b, t, lc.y);
}

//layering the perlin noises on top of each other
float pn2(vec2 coord) { 
    
    //doubling frequency and halfing amplitude of the noise
    float noise = pn(coord*4.);
    noise += pn(coord*8.2)*.5;
    noise += pn(coord*16.7)*.25;
    noise += pn(coord*32.4)*.125;
    noise += pn(coord*64.5)*.0625;
    
    //normalising our noise value as it might overrun 1 
    noise /= 1.8;
    
    return noise;
}

//circle shape
float circle(vec2 coord, vec2 pos, float rad, float blur){
    
    float dist = length(coord-pos);
    float result = smoothstep(rad, rad-blur, dist);
    return result;
}

//main function:

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalising pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord.xy/iResolution.xy;
    
    //centering the grid
    uv -= .5;
    
    //aspect ratio of the screen
    uv.x *=iResolution.x/iResolution.y; 
    
    //initialising the colour vector
    vec3 col = vec3(0.);
    
    //moon
    float m = circle(uv, vec2(-.45, +.2),.17, .04);
    
    //sun
    float s = circle(uv, vec2(0., -1.1),1., .3);
    
    //stars
    float st = circle(uv, vec2(0., 0.), .009, 0.01);
    
    for(float i = 0.; i < 20.; i++){
    
        float shift = 0.1 + i/10.;
        
        if(mod(i,2.)==0.){ //spacing
        
            //horizentals
            st += circle(uv, vec2(shift - .45, .4), .009, 0.01);
            st += circle(uv, vec2(shift - .1, .2), .009, 0.01);
            st += circle(uv, vec2(shift - .9, 0.), .009, 0.01);
            st += circle(uv, vec2(shift - .75, -.2), .009, 0.01);
            
            //verticals
            st += circle(uv, vec2(-.75, shift - .8), .009, 0.01);
            st += circle(uv, vec2(.7, shift - .8), .009, 0.01);
            st += circle(uv, vec2(-.5, shift - 2.), .009, 0.01);
            st += circle(uv, vec2(0.1, shift - .4), .009, 0.01);
        }
    }
    
    //Noise
    //to use a simple Perlin noise change pn2 to pn for a the 2d noise use N21
    float noise = pn2(uv);
    
    //background
    vec3 bg = mix(vec3(0., 0., 0.8),vec3(0.),uv.y+0.1);
    
    //mixing the sun, moon, and stars with the background, and applying noise
    col = vec3(.8)*m*noise + vec3(1.,.8,0.)*s*noise + vec3(1.)*st*noise;
    
    //without noise: uncomment the following line and comment line 104 and and 110
    //col = vec3(.8)*m + vec3(1.,.8,0.)*s + vec3(1.)*st; 
    col = mix(col,vec3(0.,0.,0.2)*noise,bg);
    
    //rendering output
    fragColor = vec4(col,1.0);
}