export const courseInfoIcons = {
  contenido: `<svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="25" height="22" fill="url(#pattern_contenido)" />
  <defs>
    <pattern id="pattern_contenido" patternContentUnits="objectBoundingBox" width="1" height="1">
      <use xlink:href="#image_contenido" transform="matrix(0.00977778 0 0 0.0111111 0.06 0)" />
    </pattern>
    <image id="image_contenido" width="90" height="90" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAABrUlEQVR4nO2cQWrDMBBF38qr9sBND1D3nnV6DJWCFyY4YMmRMlLeA23/SA/ZzIAxiIiIiIiIiIi8HhPwDVyBdGItwLzmyQ7zScHpZv3nyQ5nb3K6Wb/PPlBUUoUlOyi6EYpuxEiip8gd1Eii58gd1Eiir5E7qG3wR8HjMgGXIKJDX5pt6Fthxrui8zZ3KbzRn4rufHMjnSX05kY6S+jNjXSWlpubTgwUR4aI0B1US9Fz5SEidAfVUvTygOyl1w6qpejUSb6iUTSKVjSKJma+olE0uSKODhQ5Q4SiV0oHiqNDhKJXSgaKnCFC0Su95CsaRaNoRaNoYuYrGkWjaEWjaGLmKxpFo2hFo2hi5isaRaNoRaNoYuYrGkWjaEWjaF5UdO2Pt1NBrdr5pbWyafnxdiqsVTu/pFY2LT/eTgW1aueX1srGdzTt39G9iLiHold6ya8u2q4Du45UMb+kVjbbULsO7DrSSO/oXkTcQ9ErveQrGkWjaEUTQvQj/jiQNuuncq3a+UdrPf2nfF+Va9XOP1orm2nd4NnbsBz4Q8yZWrXzc2uJiIiIiIiIiDAif0wxX+Ywdh+jAAAAAElFTkSuQmCC" />
  </defs>
</svg>`,
  preguntas: `<svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="25" height="22" fill="url(#pattern_preguntas)" />
  <defs>
    <pattern id="pattern_preguntas" patternContentUnits="objectBoundingBox" width="1" height="1">
      <use xlink:href="#image_preguntas" transform="matrix(0.00977778 0 0 0.0111111 0.06 0)" />
    </pattern>
    <image id="image_preguntas" width="90" height="90" preserveAspectRatio="none" xlink:href="data:image/png;base64,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" />
  </defs>
</svg>`,
  comentarios: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.002 4.55295C10.6984 4.34986 13.4067 4.36324 16.101 4.59295L17.725 4.73095C18.3208 4.7819 18.8821 5.03166 19.3189 5.44009C19.7556 5.84853 20.0423 6.39192 20.133 6.98295L20.235 7.65195C20.582 9.91986 20.5496 12.2297 20.139 14.487C20.0412 15.0269 19.7568 15.5153 19.3355 15.8668C18.9142 16.2183 18.3827 16.4105 17.834 16.41H8.858C8.651 16.41 8.448 16.461 8.266 16.559L4.355 18.661C4.24071 18.7224 4.11245 18.7531 3.98275 18.7501C3.85304 18.7471 3.72633 18.7105 3.61499 18.6439C3.50364 18.5773 3.41149 18.483 3.34751 18.3701C3.28354 18.2572 3.24994 18.1297 3.25 18V9.48295C3.25026 8.23983 3.72013 7.0427 4.56552 6.1313C5.41091 5.21989 6.56941 4.6615 7.809 4.56795L8.002 4.55295ZM8 9.49995C7.66848 9.49995 7.35054 9.63165 7.11612 9.86607C6.8817 10.1005 6.75 10.4184 6.75 10.75C6.75 11.0815 6.8817 11.3994 7.11612 11.6338C7.35054 11.8683 7.66848 12 8 12C8.33152 12 8.64946 11.8683 8.88388 11.6338C9.1183 11.3994 9.25 11.0815 9.25 10.75C9.25 10.4184 9.1183 10.1005 8.88388 9.86607C8.64946 9.63165 8.33152 9.49995 8 9.49995ZM12 9.49995C11.6685 9.49995 11.3505 9.63165 11.1161 9.86607C10.8817 10.1005 10.75 10.4184 10.75 10.75C10.75 11.0815 10.8817 11.3994 11.1161 11.6338C11.3505 11.8683 11.6685 12 12 12C12.3315 12 12.6495 11.8683 12.8839 11.6338C13.1183 11.3994 13.25 11.0815 13.25 10.75C13.25 10.4184 13.1183 10.1005 12.8839 9.86607C12.6495 9.63165 12.3315 9.49995 12 9.49995ZM14.75 10.75C14.75 10.4184 14.8817 10.1005 15.1161 9.86607C15.3505 9.63165 15.6685 9.49995 16 9.49995C16.3315 9.49995 16.6495 9.63165 16.8839 9.86607C17.1183 10.1005 17.25 10.4184 17.25 10.75C17.25 11.0815 17.1183 11.3994 16.8839 11.6338C16.6495 11.8683 16.3315 12 16 12C15.6685 12 15.3505 11.8683 15.1161 11.6338C14.8817 11.3994 14.75 11.0815 14.75 10.75Z" />
</svg>`,
  beneficios: `                    <svg
                      width="26"
                      height="32"
                      viewBox="0 0 26 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                    >
                      <rect
                        y="-4"
                        width="26"
                        height="40"
                        fill="url(#pattern0_3835_1250)"
                      />
                      <defs>
                        <pattern
                          id="pattern0_3835_1250"
                          patternContentUnits="objectBoundingBox"
                          width="1"
                          height="1"
                        >
                          <use
                            xlink:href="#image0_3835_1250"
                            transform="matrix(0.0111111 0 0 0.00722222 0 0.175)"
                          />
                        </pattern>
                        <image
                          id="image0_3835_1250"
                          width="90"
                          height="90"
                          preserveAspectRatio="none"
                          xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFeElEQVR4nO2ca4hWRRjHf7v6pmt0z24ilBGBmpmX2i5mUkJkmUZ9CILaUAoqjWJxv0S2Hyz6UPkhWt0PUlaKlN1IMaKtIGiLLoS3CrsaWemuFdHuZp0YeBaW5Z3jzJw577nNDwYW3vfMM/Pf8z7zzDMXCAQCgUAgEAgEAoGANeOABUAn8AqwG+gDhoBB+XuXfPYIcJU8EzBkNrAeOAxElqUfWAfMMjVWRWYBOxzE1ZXtwMysO5UnWoC1wBGPIg+Xf4AngfFUnPOBL1IQeHT5HDiPijIX+LUBIg+XQ8BlVIxLgD8dxOoaUUeXw/PK5sVUyF0cdHwrkwqtym9VcCMtjj55H7AZuGlEXTcDLwH7HX12qQfItRZiqChko0GI1gRcCrwM/GdR/xOUOE4+YijCAWC+g43rLNySCv0upITsMBRAzQgvSDiz/MPQ1puUjNkWP+l7PNi7z9CWcjUXUSLWW8S6NU0d1wDvA7/LG/sBsFTz3ZpEF7aRTKEZZ5Eg2qSpY7pk7Oo9c7vmmecMbaos4DGUgAUWbmONgyvYCUypU2wiHJeBN3d0WnT4YU0dcyQPHaVUVlMCXrXocJy/vBzYBvydgtBbKQG7LTq813B2OQ9YAWwQ12EzUdG5n8Jz0LLT1zrYmAjcJVNrF6FVhFJ4Bi07/SNwpqOtZuBuYMDSpvp+5YSOgG8T5o6XWLoT1cbC0+f4c1ZCvSaiHedgd7OFLTVRqtRgGMUkgD4FusU1zBQ3EcfCqg2Gr3sQWvcWqknJqRq7J1nUpULQwrM6JaGHy3sau80WfvohSsDVFqJNrTOVnneUZ1SSKekbrXY5FZ6a/MxNOqzWE+vRHfPMM5pnWg1tqjh/LCWh27DTD8S4gTslTXpAVrM/Ax6MSauuMbSptpCVhumG/vJ74FgP9iZapGZnUDK2GXZ8gyy4ulKzWDZ7gxIyw2Jx9gXgBAcbpwNvWcTm0ygpj1tEAj8B7cBpBvWeLXnvfov6H6XEjHfIsP0rA59amrpxRF1LZelrl2V9kcwyS79p/RyLhdO0toSpX0AlmOO4o79LQr0mR6H7q3gaYC7wi+Nb6VJ+lv0llWQK8EkDRP64Su5ChxqUHktplXtIZoil2Lfhi6lylC3pQmskdWyVOgMapkme2SUyUUc1ngoC2zFGMnAdwJYYcbfId1rlmVJySHbc9wLPS4evBCakYCvSFN9MkD50SJ96pY+ZrivujxmEeoB7gUkFEHqS7O/riRmUVV8zo9dwCt0DLDZYUG2k0M3Sph5p49H6ofqaGRstB6s9wPKYZH0jhK5JG/ZYtl31NTM6HMOvL4FFGQh9vdh2afMqMmS+Y6OjERGDbruAT6FPlCWrJG1Vi8SZ0eK45SsaNcio42tpCa0SWN8lbONQSpGUFe8m7EQk/6y2FIRu8/AiRDJgZo7pCajIYNq8yqPQKz1N532dFEvMGYbhUWRYdNh8v91je1TfziIn9ORI6Ns8vsmqvEOOWJwToVtTSLfeQI5oclwkjTwKrbYnfONZ5L0JZ7OpsDxjoZ/1LLIqy8ghNXkDshD6Cs9+WZWv87wysygDocekdAGWupIi17zYYKFvTUHkTBNIppzieP1O5Cj0Ts8iq+N3J1OgW8AGGiR05LEMyVHoQtHmOEDpSFtk1dY7KCgrCiR0OwVnpeW9ozrSfJMzTer7ZAnwVw6FHpCopVS0Aj/kSOi+stw8U4/jZUkpbpDU4VPkt4HJVICFMdN1HT4EVrfX3J/wMFLhaAZuqbMqrSNp8l4tBJ9LhRkrF7puF0F0HHYc7DaV+fSVK5NjPnvaUFwVSn4oLsJ0K0Ng1ImudRImDsoW3a+Aj+Sm3U4JI9Vh+0AgEAgEAoFAIBAIYMj/QYoTRF1U84YAAAAASUVORK5CYII="
                        />
                      </defs>
                    </svg>`,
} as const;
