import {defineComponent,} from 'vue';
import _ from "lodash"
import styles from './index.css'


export default defineComponent({
    props: {
        data: {
            type: Object,
            default: () => {
            }
        },
        options: {
            columns: {
                type: Array,
                default: () => [],
            },
            hideHeader: {
                type: Boolean,
                default: () => {},
            },
            orderFunc: {
                type: Function,
                default: () => {},
            },
            subAreaFunc: {
                type: Function,
                default: () => {},
            }
        }
    },
    render() {
        // debugger
        const {data, options: {columns,}} = this.$props;
        // console.log(data, columns)
        // console.log(data.merge.columns)

        const CustomCell = {
            props: {
                renderResult: {
                    type: Object,
                },
            },
            render() {
                return this.renderResult
            }
        }

        const rowSpanSet = []

        const init = (index, data) => {
            const tableMergeSet = {}
            const merge = data ? data.merge || [] : []
            // debugger
            if (merge && merge.columns) {
                const cols = merge.columns
                for (let i = 0; i < cols.length; i++) {
                    const col = cols[i]
                    const mergeList = []
                    for (let j = 0; j < col.list.length; j++) {
                        const rowspan = col.list[j];
                        for (let k = 0; k < rowspan; k++) {
                            mergeList.push(k ? 0 : rowspan)
                        }
                    }
                    tableMergeSet[col.field] = {current: 0, list: col.list, mergeList: mergeList}
                }
            }

            rowSpanSet.push(tableMergeSet)

            // debugger
            // console.log('span', rowSpanSet)
        }

        const footerRowSpanSet = []

        const initFooter = (data) => {
            const merge = data ? data.merge || [] : [];
            if (merge) {
                const tableMergeSet = {};
                for (let i = 0; i < merge.length; i++) {
                    const col = merge[i];
                    const mergeList = [];
                    for (let j = 0; j < col.list.length; j++) {
                        const rowspan = col.list[j];
                        for (let k = 0; k < rowspan; k++) {
                            mergeList.push(k ? 0 : rowspan);
                        }
                    }
                    tableMergeSet[col.field] = {current: 0, list: col.list, mergeList: mergeList};
                }
                footerRowSpanSet.push(tableMergeSet);
            }
        }

        const sortChange = (column, sortOrder, columns) => {
            // 隐藏其他图标
            Object.keys(columns).forEach(key => {
                let {field} = columns[key];
                if (field !== column.field && column.sortable) {
                    columns[key].sortOrder = 'HIDDEN';
                }
            });

            // sortOrder 'HIDDEN' 'ASC' 'DESC'
            if (sortOrder === 'ASC') sortOrder = 'DESC'
            else if (sortOrder === 'DESC') sortOrder = 'ASC'
            else sortOrder = 'ASC'

            column.sortOrder = sortOrder
            // console.log(columns);
            // console.log('SortChange', column, sortOrder)
            if (column.sortChange) {
                column.sortChange(column);
            }


            // this.$emit('sortChange', {field: column.field, order: column.sortOrder})
        }

        const calRowSpan = (tableIndex, field, currentLine) => {
            // console.log('currentLine', {field, currentLine, rowSpanSet})
            const fieldSet = rowSpanSet[tableIndex][field]

            if (fieldSet) {
                // debugger
                fieldSet['current'] = fieldSet['current'] + 1;
                // console.dir(fieldSet)
                return fieldSet['mergeList'][currentLine]
            }
            return 1
        }

        const footerCalRowSpan = (tableIndex, field, currentLine) => {
            // console.log('currentLine', {field, currentLine, rowSpanSet})
            const fieldSet = footerRowSpanSet[tableIndex][field]

            if (fieldSet) {
                // debugger
                fieldSet['current'] = fieldSet['current'] + 1;
                // console.dir(fieldSet)
                return fieldSet['mergeList'][currentLine]
            }
            return 1
        }


        const getHeaderStyle = (column) => {
            const styles = {};
            if (column.align) {
                styles['text-align'] = column.align
            }
            if (column.width) {
                styles['width'] = column.width
            }

            if (column.borderRight) {
                styles['borderRight'] = column.borderRight
            }
            return styles;
        }

        const getTdClassAndStyle = (column) => {
            let styleList = {};
            let classList = [];
            if (column.align) {
                styleList['text-align'] = column.align
            }

            if (column.type === 'summary') {
                classList.push('column-title');
            }
            if (column.columnHeader) {
                if (column.firstColumn) {
                    classList.push('first-column-title')
                } else {
                    classList.push('column-title')
                }
            }
            if (column.firstColumnBorderRight) {
                styleList['border-right'] = '2px solid #fff'
            }

            if (column.style) {
                Object.keys(column.style).forEach((key, value) => {
                    styleList[key] = column.style[key];
                })
            }


            if (column.lastColumn) {
                styleList['border-left'] = '2px solid #ffffff';
                styleList['background'] = '#E0E9F3';
            }

            return {
                class: classList,
                style: styleList
            };
        }

        const renderCompareCell = ({columnField, value, row, column}, vHtml = false) => {
            if (columnField > 0) {
                return <span>
                    <span
                        style={"display: block;color: #C35050;line-height: 20px; font-size: 16px; font-family: PingFang SC, PingFang SC-Regular; font-weight: 400;"}>
                        <span>增加 {renderFooter2(row, column, value)}</span>
                        {/*<span style={"color: black; "} v-html={value}></span>*/}
                    </span>
                    <span style={"color: #C35050; font-weight: 700;"}>+{columnField.toFixed(2)}%</span>
                </span>
            } else if (columnField < 0) {
                return <span>
                    <span
                        style={"display: block;color: #3B9C41; line-height: 20px; line-height: 20px; font-size: 16px; font-family: PingFang SC, PingFang SC-Regular; font-weight: 400;"}>
                        <span>减少 {renderFooter2(row, column, value)}</span>
                        {/*<span style={"color: black; "} v-html={value}></span>*/}
                    </span>
                    <span style={"color: #3B9C41; font-weight: 700;"}>{columnField.toFixed(2)}%</span>
                </span>
            } else {
                return <span>无增减</span>
            }
        }

        const renderCompareCell2 = ({columnField, value, row, column}, vHtml = false) => {
            if (columnField > 0) {
                return <span>
                    <span
                        style={"display: block;color: #C35050;line-height: 20px; font-size: 16px; font-family: PingFang SC, PingFang SC-Regular; font-weight: 400;"}>
                        <span>增加 </span>
                        <span style={"color: black; "} v-html={value}></span>
                    </span>
                    <span style={"color: #C35050; font-weight: 700;"}>+{columnField.toFixed(2)}%</span>
                </span>
            } else if (columnField < 0) {
                return <span>
                    <span
                        style={"display: block;color: #3B9C41; line-height: 20px; line-height: 20px; font-size: 16px; font-family: PingFang SC, PingFang SC-Regular; font-weight: 400;"}>
                        <span>减少  </span>
                        <span style={"color: black; "} v-html={value}></span>
                    </span>
                    <span style={"color: #3B9C41; font-weight: 700;"}>{columnField.toFixed(2)}%</span>
                </span>
            } else {
                return <span>无增减</span>
            }
        }

        const handleTdRender = (row, column) => {
            if (column.htmlRender && column.columnCompare) {
                let columnField = row[column.compareField];
                let formatValue = column.htmlRender(row, row[column.field]);
                return renderCompareCell2({columnField, value: formatValue, row, column}, true,);
            } else if (column.htmlRender) {
                return <span v-html={column.htmlRender(row, row[column.field])}></span>
            } else if (column.formatter) {
                return column.formatter(row[column.field])
            } else if (column.customRender) {
                return this.$slots[column.customRender]({
                    name: column.customRender, row: row, value: row[column.field]
                })
            } else if (column.columnCompare) {
                let columnField = row[column.compareField];
                let value = row[column.field];
                return renderCompareCell2({columnField, value, row, column});
            } else if (column.clickAble) {
                let ca = true;
                let cae = column.clickAbleExcept || [];
                for (let i = 0; i < cae.length; i++) {
                    if (cae[i] === row[column.field]) {
                        ca = false;
                    }
                }
                if (ca) {
                    let icon = column.rightIcon ? column.rightIcon : `/images/right.png`;

                    return <span style="display: flex; position: relative; width: 100%; align-items: center;"
                                 onClick={() => column.clickEvent(row, column)}>
                        <span style="width: 95%;">{`${row[column.field]} `}</span>
                        <span style="right: 0; top:2px; ">
                            <img style="width: 20px; height: 20px; position: relative;  top: 3px;" src={icon}/>
                        </span>
                    </span>
                } else {
                    return <span style="display: flex; position: relative; width: 100%; align-items: center;">
                        <span style="width: 95%;">{`${row[column.field]} `}</span>
                    </span>
                }
            } else if (column.clickAbleHideen) {
                return <span onClick={() => column.clickEvent(row, column)}>{`${row[column.field]}`}</span>
            } else {
                return row[column.field]
            }
        }

        const totalTrRender = (total, columns, mode = 'total') => {
            console.log(total, columns);
            let list = [];
            if (_.has(total, 'merge')) {
                const {data} = total;
                for (let i = 0; i < data.length; i++) {
                    list.push(totalTrRenderRange(data[i], columns, mode, i));
                }

                return list;
            }

            return totalTrRenderRange(total, columns, mode, 0);
        }

        const totalTrRenderRange = (total, columns, mode = 'total', currentLine) => {
            return <tr>
                {columns.map((column, index) => {
                    let className = mode;
                    let styleList = {};
                    const rowspan = footerCalRowSpan(0, column.field, currentLine);
                    if (!rowspan) {
                        return '';
                    }

                    if (column.columnHeader) {
                        if (column.firstColumn) {
                            className = `first-${mode}-column-title`
                        } else {
                            className = `${mode}-column-title`
                        }
                    }

                    if (column.lastColumn) {
                        styleList['border-left'] = '2px solid #ffffff';
                        styleList['background'] = '#E0E9F3';
                    }

                    if (column.align) {
                        styleList['text-align'] = column.align
                    }

                    if (column.columnCompare) {
                        const field1 = _.find(total, ['field', column.field]);
                        const field2 = _.find(total, ['field', column.compareField]);
                        const colspan = field1.colspan

                        let value = field1.value;
                        let columnField = field2.value;


                        return <td colSpan={colspan} rowSpan={rowspan} key={index} style={styleList}
                                   className={[className]}>
                            {renderCompareCell({columnField, value, row: true, column})}
                        </td>
                    }

                    const findTotal = _.find(total, ['field', column.field])
                    if (findTotal) {
                        const colspan = findTotal.colspan
                        if (this.$slots && this.$slots[`footer-${column.field}`]) {
                            return (
                                <td colSpan={colspan} rowSpan={rowspan} key={index} style={styleList}
                                    class={[className]}>
                                    {this.$slots[`footer-${column.field}`]({value: findTotal.value})}
                                </td>
                            )
                        }


                        return (
                            <td colspan={colspan} rowSpan={rowspan} key={index} style={styleList} class={[className]}>
                                {renderFooter(findTotal, column)}
                            </td>
                        )
                    }
                })}
            </tr>
        }

        const renderFooter = (row, column) => {
            if (column && column.htmlRender) {
                return <span v-html={`${column.htmlRender(row, row.value)}`}></span>
            }
            return row.value;
        }

        const renderFooter2 = (row, column, v) => {
            if (column && column.htmlRender) {
                return <span v-html={`${column.htmlRender(row, v)}`}></span>
            }
            return v;
        }

        const renderHeader = (columns) => {
            // 隐藏表头
            let {options: {hideHeader}} = this.$props;
            let styleList = {};
            if (hideHeader) {
                styleList['visibility'] = 'hidden';
            }

            return (
                <thead style={styleList}>
                <tr>
                    {columns.map((column, index) => {
                        if (this.$slots && this.$slots[`header-${column.field}`]) {
                            return (
                                <th key={index} style={getHeaderStyle(column)}>
                                    {this.$slots[`header-${column.field}`]({column})}
                                </th>
                            )
                        } else if (column.sortable) {
                            const sortOrder = column.sortOrder || 'ASC'
                            // column.sort = {sortBy: column.field, sortOrder: column.sortOrder || 'ASC'}
                            if (sortOrder === 'HIDDEN') {
                                return (
                                    <th key={index} style={getHeaderStyle(column)}
                                        onClick={() => sortChange(column, sortOrder, columns)}>
                                        <label>{column.title}</label>
                                    </th>
                                )
                            } else {
                                return (
                                    <th key={index} style={getHeaderStyle(column)}
                                        onClick={() => sortChange(column, sortOrder, columns)}>
                                        <label>{column.title}</label>
                                        <img style="width: 15px; height: 15px; position: relative; top: 2px;"
                                             src={sortOrder === 'ASC' ? '/images/order2.png' : sortOrder === 'HIDDEN' ? '' : '/images/order.png'}/>
                                    </th>
                                )
                            }
                        } else if (column.subTitle !== null && typeof column.subTitle !== 'undefined') {
                            return (
                                <th key={index} style={getHeaderStyle(column)}>
                                    <label>{column.title}</label>
                                    <div style="position: relative; left: 5px;"
                                         class="sub-title">{column.subTitle} &#8195;  </div>
                                </th>
                            )
                        }
                        return (
                            <th key={index} style={getHeaderStyle(column)}>
                                <label>{column.title}</label>
                            </th>
                        )
                    })}
                </tr>
                </thead>
            )
        }

        const func = (data, index, columns, dic) => {
            let {options: {subAreaFunc, orderFunc}} = this.$props;

            if (dic === 'front') {
                if (orderFunc) {
                    return orderFunc(data, index, columns) || [];
                }
            } else {
                if (subAreaFunc) {
                    return subAreaFunc(data, index, columns) || [];
                }
            }
            return [];
        }


        const clickEvent = (row,) => {
            this.$emit('clickEvent', {
                row,
            })
        }

        const tr = (tableIndex, columns, row, rowIndex) => {
            if (row.isFlex === false) {
                return "";
            }

            return (
                <tr onClick={() => clickEvent(row,)}>
                    {columns.map((column, index) => {
                        {
                            return td(tableIndex, row, column, rowIndex)
                        }
                    })}
                </tr>
            )
        }


        const td = (tableIndex, row, column, rowIndex) => {
            const rowspan = calRowSpan(tableIndex, column.field, rowIndex);
            if (rowspan) {
                // console.log("rowspan: ", rowspan);
                return (<td rowSpan={rowspan} {...getTdClassAndStyle(column)}>{handleTdRender(row, column)}</td>)
            } else {
                return ''
            }
        }


        let tables = []
        // console.log("data: ", data);

        if (_.has(data, 'tables')) {
            for (let i = 0; i < data.tables.length; i++) {
                init(i, data.tables[i])
                tables.push(data.tables[i])
            }
        } else {
            init(0, data)
            tables.push({...data, total: null})
        }
        // console.log(tables);

        if (_.has(data, 'total')) {
            initFooter(data.total);
        }


        if (data) {
            return (
                <table class="wf-table">
                    {renderHeader(columns)}
                    <tbody>
                    {tables.map((data, index) => {
                        if (!data.data || data.data.length === 0) {
                            return []
                        }
                        return (
                            [
                                ...(data.data && data.data.map((row, rowIndex) => {
                                    let cell = tr(index, columns, row, rowIndex);

                                    return [...func(row, rowIndex, columns, 'front'), cell, ...func(row, rowIndex, columns, 'back')]
                                })),
                                data.total && totalTrRender(data.total, columns, 'subtotal')
                            ]
                        )
                    })}
                    </tbody>
                    <tfoot>
                    {
                        (data) && data.total && totalTrRender(data.total, columns, 'total')
                    }
                    </tfoot>
                </table>
            )
        } else {
            return <></>
        }
    },
})
