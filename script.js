//document.addEventListener('DOMContentLoaded', function () {
    console.log("start script.")

    function getBrowserUA() {
        return navigator.userAgent
    }

    function getScreenResolution() {
        return {
            width: window.screen.width,
            height: window.screen.height
        }
    }

    function renderTextImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 240
        canvas.height = 60

        context.textBaseline = 'alphabetic'
        context.fillStyle = '#f60'
        context.fillRect(100, 1, 62, 20)

        context.fillStyle = '#069'
        // It's important to use explicit built-in fonts in order to exclude the affect of font preferences
        // (there is a separate entropy source for them).
        context.font = '11pt "Times New Roman"'
        // The choice of emojis has a gigantic impact on rendering performance (especially in FF).
        // Some newer emojis cause it to slow down 50-200 times.
        // There must be no text to the right of the emoji, see https://github.com/fingerprintjs/fingerprintjs/issues/574
        // A bare emoji shouldn't be used because the canvas will change depending on the script encoding:
        // https://github.com/fingerprintjs/fingerprintjs/issues/66
        // Escape sequence shouldn't be used too because Terser will turn it into a bare unicode.
        const printedText = `Cwm fjordbank gly ${String.fromCharCode(55357, 56835) /* 😃 */}`
        context.fillText(printedText, 2, 15)
        context.fillStyle = 'rgba(102, 204, 0, 0.2)'
        context.font = '18pt Arial'
        context.fillText(printedText, 4, 45)
    }


    function renderImages(canvas, context) {
        renderTextImage(canvas, context)
        const textImage1 = canvas.toDataURL()
        const textImage2 = canvas.toDataURL() // It's slightly faster to double-encode the text image

        // Some browsers add a noise to the canvas: https://github.com/fingerprintjs/fingerprintjs/issues/791
        // The canvas is excluded from the fingerprint in this case
        if (textImage1 !== textImage2) {
            return ['unstable', 'unstable']
        }

        // Text is unstable:
        // https://github.com/fingerprintjs/fingerprintjs/issues/583
        // https://github.com/fingerprintjs/fingerprintjs/issues/103
        // Therefore it's extracted into a separate image.
        renderGeometryImage(canvas, context)
        const geometryImage = canvas.toDataURL()
        hashedtextImage = x64hash128(textImage1, 31)
        hashedgeometryImage = x64hash128(geometryImage, 31)
        return { "geometry": hashedgeometryImage, "text": hashedtextImage }
    }

    function renderGeometryImage(canvas, context) {
        // Resizing the canvas cleans it
        canvas.width = 122
        canvas.height = 110

        // Canvas blending
        // https://web.archive.org/web/20170826194121/http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        context.globalCompositeOperation = 'multiply'
        for (const [color, x, y] of [
            ['#f2f', 40, 40],
            ['#2ff', 80, 40],
            ['#ff2', 60, 80],
        ]) {
            context.fillStyle = color
            context.beginPath()
            context.arc(x, y, 40, 0, Math.PI * 2, true)
            context.closePath()
            context.fill()
        }

        // Canvas winding
        // https://web.archive.org/web/20130913061632/http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        context.fillStyle = '#f9c'
        context.arc(60, 60, 60, 0, Math.PI * 2, true)
        context.arc(60, 60, 20, 0, Math.PI * 2, true)
        context.fill('evenodd')
    }

    function getCanvasFp() {
        let geometry
        let text

        var canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        context = canvas.getContext('2d')
        return renderImages(canvas, context)
    }

    function getMathFp() {
        fallbackFn = () => 0
        const acos = Math.acos || fallbackFn
        const acosh = Math.acosh || fallbackFn
        const asin = Math.asin || fallbackFn
        const asinh = Math.asinh || fallbackFn
        const atanh = Math.atanh || fallbackFn
        const atan = Math.atan || fallbackFn
        const sin = Math.sin || fallbackFn
        const sinh = Math.sinh || fallbackFn
        const cos = Math.cos || fallbackFn
        const cosh = Math.cosh || fallbackFn
        const tan = Math.tan || fallbackFn
        const tanh = Math.tanh || fallbackFn
        const exp = Math.exp || fallbackFn
        const expm1 = Math.expm1 || fallbackFn
        const log1p = Math.log1p || fallbackFn

        // Operation polyfills
        const powPI = (value) => Math.pow(Math.PI, value)
        const acoshPf = (value) => Math.log(value + Math.sqrt(value * value - 1))
        const asinhPf = (value) => Math.log(value + Math.sqrt(value * value + 1))
        const atanhPf = (value) => Math.log((1 + value) / (1 - value)) / 2
        const sinhPf = (value) => Math.exp(value) - 1 / Math.exp(value) / 2
        const coshPf = (value) => (Math.exp(value) + 1 / Math.exp(value)) / 2
        const expm1Pf = (value) => Math.exp(value) - 1
        const tanhPf = (value) => (Math.exp(2 * value) - 1) / (Math.exp(2 * value) + 1)
        const log1pPf = (value) => Math.log(1 + value)
        // Note: constant values are empirical
        result = {
            acos: acos(0.123124234234234242),
            acosh: acosh(1e308),
            acoshPf: acoshPf(1e154), // 1e308 will not work for polyfill
            asin: asin(0.123124234234234242),
            asinh: asinh(1),
            asinhPf: asinhPf(1),
            atanh: atanh(0.5),
            atanhPf: atanhPf(0.5),
            atan: atan(0.5),
            sin: sin(-1e300),
            sinh: sinh(1),
            sinhPf: sinhPf(1),
            cos: cos(10.000000000123),
            cosh: cosh(1),
            coshPf: coshPf(1),
            tan: tan(-1e300),
            tanh: tanh(1),
            tanhPf: tanhPf(1),
            exp: exp(1),
            expm1: expm1(1),
            expm1Pf: expm1Pf(1),
            log1p: log1p(10),
            log1pPf: log1pPf(10),
            powPI: powPI(-100),
        }
        //console.log("math result ", result)
        result = JSON.stringify(result)
        return x64hash128(result, 31)
    }

    function getWebGLContext() {
        const canvas = document.createElement('canvas')

        canvas.addEventListener('webglCreateContextError', () => (context = undefined))

        for (const type of ['webgl', 'experimental-webgl']) {
            try {
                context = canvas.getContext(type)
            } catch {
                // Ok, continue
            }
            if (context) {
                break
            }
        }
        return context
    }

    // 获取对象原型上的常量键名
    function getConstantsFromPrototype(obj) {
        // 获取对象原型上的所有键名
        var keys = Object.keys(Object.getPrototypeOf(obj));

        // 过滤出符合常量命名规范的键名
        return keys.filter(isConstantLike);
    }

    // 判断键名是否符合常量命名规范
    function isConstantLike(key) {
        return typeof key === 'string' && !key.match(/[^A-Z0-9_]/);
    }

    function getShaderPrecision(
        gl,
        shaderType,
        precisionType,
    ) {
        const shaderPrecision = gl.getShaderPrecisionFormat(gl[shaderType], gl[precisionType])
        return shaderPrecision ? [shaderPrecision.rangeMin, shaderPrecision.rangeMax, shaderPrecision.precision] : []
    }

    function getWebGlExtensions() {
        const validContextParameters = new Set([
            10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968,
            2978, 3024, 3042, 3088, 3089, 3106, 3107, 32773, 32777, 32777, 32823, 32824, 32936, 32937, 32938, 32939, 32968, 32969,
            32970, 32971, 3317, 33170, 3333, 3379, 3386, 33901, 33902, 34016, 34024, 34076, 3408, 3410, 3411, 3412, 3413, 3414,
            3415, 34467, 34816, 34817, 34818, 34819, 34877, 34921, 34930, 35660, 35661, 35724, 35738, 35739, 36003, 36004, 36005,
            36347, 36348, 36349, 37440, 37441, 37443, 7936, 7937, 7938,
            // SAMPLE_ALPHA_TO_COVERAGE (32926) and SAMPLE_COVERAGE (32928) are excluded because they trigger a console warning
            // in IE, Chrome ≤ 59 and Safari ≤ 13 and give no entropy.
        ])
        const validExtensionParams = new Set([
            34047, // MAX_TEXTURE_MAX_ANISOTROPY_EXT
            35723, // FRAGMENT_SHADER_DERIVATIVE_HINT_OES
            36063, // MAX_COLOR_ATTACHMENTS_WEBGL
            34852, // MAX_DRAW_BUFFERS_WEBGL
            34853, // DRAW_BUFFER0_WEBGL
            34854, // DRAW_BUFFER1_WEBGL
            34229, // VERTEX_ARRAY_BINDING_OES
            36392, // TIMESTAMP_EXT
            36795, // GPU_DISJOINT_EXT
            38449, // MAX_VIEWS_OVR
        ])
        const shaderTypes = ['FRAGMENT_SHADER', 'VERTEX_SHADER']
        const precisionTypes = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT', 'LOW_INT', 'MEDIUM_INT', 'HIGH_INT']
        const rendererInfoExtensionName = 'WEBGL_debug_renderer_info'
        const polygonModeExtensionName = 'WEBGL_polygon_mode'
        const gl = getWebGLContext()
        if (!gl) {
            return -1
        }

        const extensions = gl.getSupportedExtensions()
        const contextAttributes = gl.getContextAttributes()
        const unsupportedExtensions = []

        // Features
        const attributes = []
        const parameters = []
        const extensionParameters = []
        const shaderPrecisions = []

        // Context attributes
        if (contextAttributes) {
            for (const attributeName of Object.keys(contextAttributes)) {
                attributes.push(`${attributeName}=${contextAttributes[attributeName]}`)
            }
        }

        // Context parameters
        const constants = getConstantsFromPrototype(gl)
        for (constant of constants) {
            code = gl[constant]
            parameters.push(`${constant}=${code}${validContextParameters.has(code) ? `=${gl.getParameter(code)}` : ''}`)
        }

        // Extension parameters
        if (extensions) {
            for (name of extensions) {
                extension = gl.getExtension(name)
                if (!extension) {
                    unsupportedExtensions.push(name)
                    continue
                }

                for (constant of getConstantsFromPrototype(extension)) {
                    const code = extension[constant]
                    extensionParameters.push(
                        `${constant}=${code}${validExtensionParams.has(code) ? `=${gl.getParameter(code)}` : ''}`,
                    )
                }
            }
        }

        // Shader precision
        for (shaderType of shaderTypes) {
            for (precisionType of precisionTypes) {
                shaderPrecision = getShaderPrecision(gl, shaderType, precisionType)
                shaderPrecisions.push(`${shaderType}.${precisionType}=${shaderPrecision.join(',')}`)
            }
        }

        // Postprocess
        extensionParameters.sort()
        parameters.sort()
        return {
            contextAttributes: x64hash128(attributes.join(""), 31),
            parameters: x64hash128(parameters.join(""), 31),
            shaderPrecisions: x64hash128(shaderPrecisions.join(""), 31),
            extensions: x64hash128(extensions.join(""), 31),
            extensionParameters: x64hash128(extensionParameters.join(""), 31),
            unsupportedExtensions,
        }
    }

    function getHash(signal) {
        let hash = 0
        for (let i = 0; i < signal.length; ++i) {
            hash += Math.abs(signal[i])
        }
        return hash
    }

    function makeInnerError(name) {
        const error = new Error(name)
        error.name = name
        return error
    }

    function startRenderingAudio(context) {
        const renderTryMaxCount = 3
        const renderRetryDelay = 500
        const runningMaxAwaitTime = 500
        const runningSufficientTime = 5000
        let finalize = () => undefined
        const resultPromise = new Promise((resolve, reject) => {
            let isFinalized = false
            let renderTryCount = 0
            let startedRunningAt = 0
            context.oncomplete = (event) => resolve(event.renderedBuffer)

            const startRunningTimeout = () => {
                setTimeout(
                    () => reject(makeInnerError("timeout")),
                    Math.min(runningMaxAwaitTime, startedRunningAt + runningSufficientTime - Date.now()),
                )
            }

            const tryRender = () => {
                try {
                    const renderingPromise = context.startRendering()

                    switch (context.state) {
                        case 'running':
                            startedRunningAt = Date.now()
                            if (isFinalized) {
                                startRunningTimeout()
                            }
                            break

                        // Sometimes the audio context doesn't start after calling `startRendering` (in addition to the cases where
                        // audio context doesn't start at all). A known case is starting an audio context when the browser tab is in
                        // background on iPhone. Retries usually help in this case.
                        case 'suspended':
                            // The audio context can reject starting until the tab is in foreground. Long fingerprint duration
                            // in background isn't a problem, therefore the retry attempts don't count in background. It can lead to
                            // a situation when a fingerprint takes very long time and finishes successfully. FYI, the audio context
                            // can be suspended when `document.hidden === false` and start running after a retry.
                            if (!document.hidden) {
                                renderTryCount++
                            }
                            if (isFinalized && renderTryCount >= renderTryMaxCount) {
                                reject(makeInnerError(InnerErrorName.Suspended))
                            } else {
                                setTimeout(tryRender, renderRetryDelay)
                            }
                            break
                    }
                } catch (error) {
                    reject(error)
                }
            }

            tryRender()

            finalize = () => {
                if (!isFinalized) {
                    isFinalized = true
                    if (startedRunningAt > 0) {
                        startRunningTimeout()
                    }
                }
            }
        })
console.log("startRenderingAudio3")
        return [resultPromise, finalize]
    }

    function getAudioFp() {
        const hashToIndex = 5000
        const w = window
        const AudioContext = w.OfflineAudioContext || w.webkitOfflineAudioContext
        if (!AudioContext) {
            return -1
        }
        const context = new AudioContext(1, hashToIndex, 44100)
        const oscillator = context.createOscillator()
        oscillator.type = 'triangle'
        oscillator.frequency.value = 10000

        const compressor = context.createDynamicsCompressor()
        compressor.threshold.value = -50
        compressor.knee.value = 40
        compressor.ratio.value = 12
        compressor.attack.value = 0
        compressor.release.value = 0.25

        oscillator.connect(compressor)
        compressor.connect(context.destination)
        oscillator.start(0)
        return startRenderingAudio(context)
    }

    function collectData() {
        const uaPromise = new Promise((resolve) => {
            startTime = performance.now()
            result = getBrowserUA()
            endTime = performance.now()
            resolve("UA: " + result + " cost: " + (endTime - startTime) + "ms")
        })
        const screenPromise = new Promise((resolve) => {
            startTime = performance.now()
            result = JSON.stringify(getScreenResolution())
            endTime = performance.now()
            resolve("Screen: " + result + " cost: " + (endTime - startTime) + "ms")
        })

        const canvasFpPromise = new Promise((resolve) => {
            console.log("call canvasFpPromise")
            startTime = performance.now()
            result = JSON.stringify(getCanvasFp())
            console.log("canvasFpPromise end")
            endTime = performance.now()
            resolve("CanvasFp: " + result + " cost: " + (endTime - startTime) + "ms")
        })

        const mathFpPromise = new Promise((resolve) => {
            console.log("call mathFpPromise")
            startTime = performance.now()
            result = getMathFp()
              console.log("mathFpPromise end")
            endTime = performance.now()
            resolve("MathFp: " + result + " cost: " + (endTime - startTime) + "ms")
        })

        const webglFpPromise = new Promise((resolve) => {
            console.log("call webgl")
            startTime = performance.now()
            result = JSON.stringify(getWebGlExtensions())
              console.log("webglFpPromise end")
            endTime = performance.now()
            resolve("WebglFp: " + result + " cost: " + (endTime - startTime) + "ms")
        })

        const audioFpPromise = new Promise((resolve) => {
            const hashFromIndex = 4500
            startTime = performance.now();
            [audioPromise, finishFunc] = getAudioFp()
            audioPromise.then(
                (buffer) => {
                    console.log("sucess")
                    result = getHash(buffer.getChannelData(0).subarray(hashFromIndex))
                    finishFunc()
                    endTime = performance.now()
                    resolve("AudioFp: " + result + " cost: " + (endTime - startTime) + "ms")
                },
                (error) => {
                    console.log("promise error")
                    if (error.name === InnerErrorName.Timeout || error.name === InnerErrorName.Suspended) {
                        return SpecialFingerprint.Timeout
                    }
                    throw error
                },
            )

        })

        const timeoutPromise = new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })

        Promise.race([Promise.allSettled([uaPromise, screenPromise, canvasFpPromise, mathFpPromise, webglFpPromise, audioFpPromise]), timeoutPromise]).then((results) => {
            if (Array.isArray(results)) {
                const fulFilledResults = results.filter(result => result.status === 'fulfilled')
                    .map(result => result.value);
                fullstr = fulFilledResults.join('\n')
                console.log("full str " + fullstr)
                const displayElement = document.getElementById('visitor-id-display')
                displayElement.textContent = "Collect Result: \n" + fullstr
            }
        })
    }

    //collectData()
    //requestAnimationFrame(()=> {
    //    requestAnimationFrame(collectData)
    //})
//})


window.onload = function() {
    // 你的代码在页面加载完成后执行
    console.log('页面加载完成，FCP之后');
    collectData()
};

////////utils//////////////

/**
 * Adds two 64-bit values (provided as tuples of 32-bit values)
 * and updates (mutates) first value to write the result
 */
function x64Add(m, n) {
    const m0 = m[0] >>> 16,
        m1 = m[0] & 0xffff,
        m2 = m[1] >>> 16,
        m3 = m[1] & 0xffff

    const n0 = n[0] >>> 16,
        n1 = n[0] & 0xffff,
        n2 = n[1] >>> 16,
        n3 = n[1] & 0xffff

    let o0 = 0,
        o1 = 0,
        o2 = 0,
        o3 = 0
    o3 += m3 + n3
    o2 += o3 >>> 16
    o3 &= 0xffff
    o2 += m2 + n2
    o1 += o2 >>> 16
    o2 &= 0xffff
    o1 += m1 + n1
    o0 += o1 >>> 16
    o1 &= 0xffff
    o0 += m0 + n0
    o0 &= 0xffff

    m[0] = (o0 << 16) | o1
    m[1] = (o2 << 16) | o3
}

/**
 * Multiplies two 64-bit values (provided as tuples of 32-bit values)
 * and updates (mutates) first value to write the result
 */
function x64Multiply(m, n) {
    const m0 = m[0] >>> 16,
        m1 = m[0] & 0xffff,
        m2 = m[1] >>> 16,
        m3 = m[1] & 0xffff

    const n0 = n[0] >>> 16,
        n1 = n[0] & 0xffff,
        n2 = n[1] >>> 16,
        n3 = n[1] & 0xffff
    let o0 = 0,
        o1 = 0,
        o2 = 0,
        o3 = 0

    o3 += m3 * n3
    o2 += o3 >>> 16
    o3 &= 0xffff
    o2 += m2 * n3
    o1 += o2 >>> 16
    o2 &= 0xffff
    o2 += m3 * n2
    o1 += o2 >>> 16
    o2 &= 0xffff
    o1 += m1 * n3
    o0 += o1 >>> 16
    o1 &= 0xffff
    o1 += m2 * n2
    o0 += o1 >>> 16
    o1 &= 0xffff
    o1 += m3 * n1
    o0 += o1 >>> 16
    o1 &= 0xffff
    o0 += m0 * n3 + m1 * n2 + m2 * n1 + m3 * n0
    o0 &= 0xffff

    m[0] = (o0 << 16) | o1
    m[1] = (o2 << 16) | o3
}

/**
 * Provides left rotation of the given int64 value (provided as tuple of two int32)
 * by given number of bits. Result is written back to the value
 */
function x64Rotl(m, bits) {
    const m0 = m[0]
    bits %= 64
    if (bits === 32) {
        m[0] = m[1]
        m[1] = m0
    } else if (bits < 32) {
        m[0] = (m0 << bits) | (m[1] >>> (32 - bits))
        m[1] = (m[1] << bits) | (m0 >>> (32 - bits))
    } else {
        bits -= 32
        m[0] = (m[1] << bits) | (m0 >>> (32 - bits))
        m[1] = (m0 << bits) | (m[1] >>> (32 - bits))
    }
}

/**
 * Provides a left shift of the given int32 value (provided as tuple of [0, int32])
 * by given number of bits. Result is written back to the value
 */
function x64LeftShift(m, bits) {
    bits %= 64
    if (bits === 0) {
        return
    } else if (bits < 32) {
        m[0] = m[1] >>> (32 - bits)
        m[1] = m[1] << bits
    } else {
        m[0] = m[1] << (bits - 32)
        m[1] = 0
    }
}

/**
 * Provides a XOR of the given int64 values(provided as tuple of two int32).
 * Result is written back to the first value
 */
function x64Xor(m, n) {
    m[0] ^= n[0]
    m[1] ^= n[1]
}

const F1 = [0xff51afd7, 0xed558ccd]
const F2 = [0xc4ceb9fe, 0x1a85ec53]
/**
 * Calculates murmurHash3's final x64 mix of that block and writes result back to the input value.
 * (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
 * only place where we need to right shift 64bit ints.)
 */
function x64Fmix(h) {
    const shifted = [0, h[0] >>> 1]
    x64Xor(h, shifted)
    x64Multiply(h, F1)
    shifted[1] = h[0] >>> 1
    x64Xor(h, shifted)
    x64Multiply(h, F2)
    shifted[1] = h[0] >>> 1
    x64Xor(h, shifted)
}

const C1 = [0x87c37b91, 0x114253d5]
const C2 = [0x4cf5ad43, 0x2745937f]
const M = [0, 5]
const N1 = [0, 0x52dce729]
const N2 = [0, 0x38495ab5]
/**
 * Given a string and an optional seed as an int, returns a 128 bit
 * hash using the x64 flavor of MurmurHash3, as an unsigned hex.
 * All internal functions mutates passed value to achieve minimal memory allocations and GC load
 *
 * Benchmark https://jsbench.me/p4lkpaoabi/1
 */
function x64hash128(input, seed) {
    const key = getUTF8Bytes(input)
    seed = seed || 0
    const length = [0, key.length]
    const remainder = length[1] % 16
    const bytes = length[1] - remainder
    const h1 = [0, seed]
    const h2 = [0, seed]
    const k1 = [0, 0]
    const k2 = [0, 0]

    let i
    for (i = 0; i < bytes; i = i + 16) {
        k1[0] = key[i + 4] | (key[i + 5] << 8) | (key[i + 6] << 16) | (key[i + 7] << 24)
        k1[1] = key[i] | (key[i + 1] << 8) | (key[i + 2] << 16) | (key[i + 3] << 24)
        k2[0] = key[i + 12] | (key[i + 13] << 8) | (key[i + 14] << 16) | (key[i + 15] << 24)
        k2[1] = key[i + 8] | (key[i + 9] << 8) | (key[i + 10] << 16) | (key[i + 11] << 24)

        x64Multiply(k1, C1)
        x64Rotl(k1, 31)
        x64Multiply(k1, C2)
        x64Xor(h1, k1)
        x64Rotl(h1, 27)
        x64Add(h1, h2)
        x64Multiply(h1, M)
        x64Add(h1, N1)
        x64Multiply(k2, C2)
        x64Rotl(k2, 33)
        x64Multiply(k2, C1)
        x64Xor(h2, k2)
        x64Rotl(h2, 31)
        x64Add(h2, h1)
        x64Multiply(h2, M)
        x64Add(h2, N2)
    }
    k1[0] = 0
    k1[1] = 0
    k2[0] = 0
    k2[1] = 0
    const val = [0, 0]
    switch (remainder) {
        case 15:
            val[1] = key[i + 14]
            x64LeftShift(val, 48)
            x64Xor(k2, val)
        // fallthrough
        case 14:
            val[1] = key[i + 13]
            x64LeftShift(val, 40)
            x64Xor(k2, val)
        // fallthrough
        case 13:
            val[1] = key[i + 12]
            x64LeftShift(val, 32)
            x64Xor(k2, val)
        // fallthrough
        case 12:
            val[1] = key[i + 11]
            x64LeftShift(val, 24)
            x64Xor(k2, val)
        // fallthrough
        case 11:
            val[1] = key[i + 10]
            x64LeftShift(val, 16)
            x64Xor(k2, val)
        // fallthrough
        case 10:
            val[1] = key[i + 9]
            x64LeftShift(val, 8)
            x64Xor(k2, val)
        // fallthrough
        case 9:
            val[1] = key[i + 8]

            x64Xor(k2, val)
            x64Multiply(k2, C2)
            x64Rotl(k2, 33)
            x64Multiply(k2, C1)
            x64Xor(h2, k2)
        // fallthrough
        case 8:
            val[1] = key[i + 7]
            x64LeftShift(val, 56)
            x64Xor(k1, val)
        // fallthrough
        case 7:
            val[1] = key[i + 6]
            x64LeftShift(val, 48)
            x64Xor(k1, val)
        // fallthrough
        case 6:
            val[1] = key[i + 5]
            x64LeftShift(val, 40)
            x64Xor(k1, val)
        // fallthrough
        case 5:
            val[1] = key[i + 4]
            x64LeftShift(val, 32)
            x64Xor(k1, val)
        // fallthrough
        case 4:
            val[1] = key[i + 3]
            x64LeftShift(val, 24)
            x64Xor(k1, val)
        // fallthrough
        case 3:
            val[1] = key[i + 2]
            x64LeftShift(val, 16)
            x64Xor(k1, val)
        // fallthrough
        case 2:
            val[1] = key[i + 1]
            x64LeftShift(val, 8)
            x64Xor(k1, val)
        // fallthrough
        case 1:
            val[1] = key[i]

            x64Xor(k1, val)
            x64Multiply(k1, C1)
            x64Rotl(k1, 31)
            x64Multiply(k1, C2)
            x64Xor(h1, k1)
        // fallthrough
    }
    x64Xor(h1, length)
    x64Xor(h2, length)
    x64Add(h1, h2)
    x64Add(h2, h1)
    x64Fmix(h1)
    x64Fmix(h2)
    x64Add(h1, h2)
    x64Add(h2, h1)
    return (
        ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8)
    )
}

function getUTF8Bytes(input) {
    // Benchmark: https://jsbench.me/b6klaaxgwq/1
    // If you want to just count bytes, see solutions at https://jsbench.me/ehklab415e/1
    const result = new Uint8Array(input.length)
    for (let i = 0; i < input.length; i++) {
        // `charCode` is faster than encoding, so we prefer that when it's possible
        const charCode = input.charCodeAt(i)

        // In case of non-ASCII symbols we use proper encoding
        if (charCode > 127) {
            return new TextEncoder().encode(input)
        }
        result[i] = charCode
    }
    return result
}