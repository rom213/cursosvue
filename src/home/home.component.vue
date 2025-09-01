<script setup lang="ts">
import footerComponent from '../components/footer/footer.component.vue';
import SectionFiveComponent from './section_five/section.five.component.vue';
import SectionFourComponent from './section_four/section.four.component.vue';
import SectionOneComponent from './section_one/section.one.component.vue';
import SectionTestamentComponent from './section_seven/section.testament.component.vue';
import SectionSixComponent from './section_six/section.six.component.vue';
import SectionThreeComponent from './section_three/section.three.component.vue';
import SectionTwoComponent from './section_two/section.two.component.vue';


</script>

<template>
    <div class="grid">

        <SectionOneComponent />
        <SectionTwoComponent />
    </div>

    <SectionFourComponent />
    <SectionFiveComponent />
    <br>
    <div class="px-4">
        <SectionSixComponent />
    </div>
    <br>
    <SectionTestamentComponent />
    <SectionThreeComponent />
    <footerComponent />



</template>