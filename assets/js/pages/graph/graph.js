import React, {Component} from 'react';
import {Input, Button, Icon} from '../../components';
import {Alert, DatabaseActions, GraphActions} from '../../actions';
import PropTypes from 'prop-types';
import {Link} from '../../components/_link';

export class GraphComponent extends Component {
    constructor(props) {
        super(props);
        const lines = [];
        lines.push(this.getBlankLine());

        this.state = {
            id: '',
            table: '',
            tableId: '',
            title: '',
            maxPoint: '12',
            lines,
            tables: [],
            tableError: false,
            titleError: false,
            maxPointError: false
        };
        this.onTableChange = this.onTableChange.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onMaxPointChange = this.onMaxPointChange.bind(this);
        this.onLineChange = this.onLineChange.bind(this);
        this.addMoreLine = this.addMoreLine.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    loadTable() {
        const that = this;
        DatabaseActions.getAllTable()
            .then(res => {
                const {error, data} = res;
                if (error) {
                    return;
                }

                that.setState({
                    tables: data
                });
            });
    }

    loadData(id) {
        const that = this;
        GraphActions.loadGraph(id)
            .then(res => {
                const {error, data} = res;
                if (error) {
                    return;
                }

                const {table_id, title, max_point, lines} = data;
                that.setState({
                    tableId: table_id,
                    title,
                    maxPoint: max_point,
                    lines
                });
            });
    }

    init() {
        const {id = null, table = null, graph = {}} = this.props;
        if (table === null) {
            this.loadTable();
        }

        if (id && $.isEmptyObject(graph)) {
            this.loadData(id);
        }

        if (!$.isEmptyObject(graph)) {
            this.setState(graph);
        }

        this.setState({id, table});
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {id = '', table = '', graph = {}} = this.props;
        const preId = prevProps.id ? prevProps.id : '';
        const preTable = prevProps.table ? prevProps.table : '';
        if (id !== preId || table !== preTable || ($.isEmptyObject(graph) !== $.isEmptyObject(prevProps.graph))) {
            this.init();
        }
    }

    getBlankLine() {
        return {id: '', title: '', color: '', filter: '', error: false};
    }

    onTableChange(e) {
        this.setState({
            tableId: e.target.value,
            tableError: false
        });
    }

    onTitleChange(e) {
        this.setState({
            title: e.target.value,
            titleError: false
        });
    }

    onMaxPointChange(e) {
        this.setState({
            maxPoint: e.target.value,
            maxPointError: false
        });
    }

    onLineChange(key, name, e) {
        const {lines} = this.state;
        lines[key][name] = e.target.value;
        this.setState({
            lines
        });
    }

    deleteLine(key) {
        const {lines} = this.state;
        lines.splice(key, 1);
        if (lines.length === 0) {
            lines.push(this.getBlankLine());
        }

        this.setState({
            lines
        });
    }

    addMoreLine() {
        const {lines} = this.state;
        lines.push(this.getBlankLine());
        this.setState({
            lines
        });
    }

    onSubmit() {
        let {id, tableId, title, maxPoint, lines} = this.state;
        let hasError = false;
        tableId = parseInt(tableId);
        if (isNaN(tableId)) {
            this.setState({
                tableError: true
            });
            hasError = true;
        }

        title = $.trim(title);
        maxPoint = parseInt(maxPoint);

        if (title === '') {
            this.setState({
                titleError: true
            });
            hasError = true;
        }

        if (isNaN(maxPoint) || maxPoint < 2 || maxPoint > 128) {
            this.setState({
                maxPointError: true
            });
            hasError = true;
        }

        let lineChange = false;
        for (const line of lines) {
            if (line.error) {
                lineChange = true;
                line.error = false;
            }

            if ($.trim(line.title) === '' || $.trim(line.color) === '') {
                line.error = true;
                lineChange = true;
                hasError = true;
            }
        }

        if (lineChange) {
            this.setState({
                lines
            });
        }

        if (!hasError) {
            const that = this;
            GraphActions.createOrUpdate(id, {
                table: tableId,
                title,
                maxPoint,
                lines
            }).then(res => {
                const {error, redirect} = res;
                if (error) {
                    return;
                }

                if (redirect) {
                    window.location.href = redirect;
                } else {
                    Alert.success('Update successful');
                    that.loadData(id);
                }
            });
        }
    }

    render() {
        const {className} = this.props;
        const {id, table, tableId, tables, title, maxPoint, lines, tableError, titleError, maxPointError} = this.state;

        const _lines = lines.map((item, key) => {
            return <div key={key} className="form-group">
                <div className={'row'}>
                    <div className={'col-3'}>
                        <Input className={item.error && item.title === '' ? 'is-invalid' : ''} value={item.title} onChange={e => this.onLineChange(key, 'title', e)} placeholder={'Line title'} />
                    </div>
                    <div className={'col-1'}>
                        <Input className={item.error && item.title === '' ? 'is-invalid' : ''} value={item.color} onChange={e => this.onLineChange(key, 'color', e)} placeholder={'Line color'} />
                    </div>
                    <div className={'col-7'}>
                        <Input value={item.filter ? item.filter : ''} onChange={e => this.onLineChange(key, 'filter', e)} placeholder={'status = 200'} />
                    </div>
                    <div className={'col-1'}>
                        <Button onClick={e => this.deleteLine(key)} color={'danger'}><Icon name={'trash'}/></Button>
                    </div>
                </div>
            </div>;
        });

        return (
            <div className={className}>
                <div className="form-group">
                    <label>Table</label>
                    {table && <Link className={'ml-3'} href={'/database/' + table} >{table}</Link>}
                    {tables.length > 0 && <select value={tableId} className={tableError ? 'form-control is-invalid' : 'form-control'} onChange={this.onTableChange}>
                        <option value="">Select table</option>
                        {tables.map((item, key) => {
                            return <option key={key} value={item.id}>{item.name}</option>;
                        })}
                    </select>}
                </div>
                <div className="form-group">
                    <label>Graph title</label>
                    <Input className={titleError ? 'is-invalid' : ''} placeholder="Title" value={title} onChange={this.onTitleChange}/>
                </div>
                <div className="form-group">
                    <label>Max point</label>
                    <Input className={maxPointError ? 'is-invalid' : ''} placeholder="Max point" value={maxPoint} onChange={this.onMaxPointChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Lines</label>
                    <div className="row">
                        <div className="col-3">
                            Name
                        </div>
                        <div className="col-1">
                            Color
                        </div>
                        <div className="col-8">
                            Filter
                        </div>
                    </div>
                </div>
                {_lines}

                <div className="box-footer">
                    <Button color={'success'} onClick={this.onSubmit} >{id ? 'Update graph' : 'Create graph'}</Button>
                    <Button color={'primary'} className={'ml-3'} onClick={this.addMoreLine} >Add more line</Button>
                </div>
            </div>
        );
    }
}
GraphComponent.propTypes = {
    id: PropTypes.string,
    table: PropTypes.string,
    graph: PropTypes.object,
    className: PropTypes.string
};
