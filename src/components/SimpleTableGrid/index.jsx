import {defineComponent,} from 'vue';
import WfSuperTableGrid from "@/components/WfSuperTableGrid";


export default defineComponent({
    components: {
        WfSuperTableGrid,
    },
    props: {
        data: {
            type: Object,
            default: () => {
            }
        },
        options: {
            columns: {
                type: Array,
                default: () => []
            },
            hideHeader: {
                type: Boolean
            },
            orderFunc: {
                type: Function
            },
            subAreaFunc: {
                type: Function,
            }
        }
    },
    render() {
        const {data, options} = this.$props;

        return (
            <wf-super-table-grid data={data} options={options}/>
        )
    }
})
