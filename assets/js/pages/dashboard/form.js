import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Button, ResponsiveGridLayout, Select2, FormField, Icon} from '../../components/';
import '../../../styles/component/_dashboard-form.scss';
import {WIDGET_TYPE} from "../../utils";
import {isEqual, differenceWith} from "lodash";
import {Alert, DashboardActions, DatabaseActions, WidgetActions} from "../../actions";

class DashboardPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tables: [],
            widgetSelected: [],
            initialWidgetSelected: [],
            dashboardDetail: {},
            initialData: {},
            errors: {},
            widgets: [],
            isLoading: false,
        }

        this.onChangeData = this.onChangeData.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
    }


    onChangeData({name, value}) {
        if (name) {
            this.setState((preState) => ({
                dashboardDetail: {
                    ...preState.dashboardDetail,
                    [name]: value,
                }
            }))

            if (name === 'title') {
                if (!value) {
                    this.setState({
                        errors: {
                            title: true,
                        }
                    });
                    return;
                } else {
                    this.setState({
                        errors: {},
                    })
                }
            }
        }
    }

    async componentDidMount() {
        // call dashboardDetail detail API here

        this.setState({
            isLoading: true,
        })

        const {dashboard} = this.props;

        const [
            dashboardRes,
            tableRes,
            widgetListRes,
        ] = await Promise.all([
            dashboard && DashboardActions.loadDashboard(dashboard),
            DatabaseActions.getAllTable(),
            WidgetActions.listWidget(),
        ]);


        const widgetSelected = dashboardRes && !dashboardRes.error && dashboardRes.widgets && dashboardRes.widgets.length > 0 ? [...dashboardRes.widgets] : [];

        const dashboardDetail = dashboardRes && !dashboardRes.error && dashboardRes.data ? {
            ...dashboardRes.data,
            table: widgetSelected[0].table,
        } : {};

        const widgetList = widgetListRes && widgetListRes.data && widgetListRes.data.length > 0 ? widgetListRes.data : [];

        let tables = tableRes && tableRes.data && tableRes.data.length > 0 ? tableRes.data.map(item => ({
            value: item,
            label: item
        })) : [];


        this.setState({
            dashboardDetail,
            initialData: {...dashboardDetail},
            widgetSelected,
            initialWidgetSelected: [...widgetSelected],
            widgetList: [
                ...widgetList,
                {
                    column: "url",
                    id: 1,
                    last_updated: "2021-03-10 08:01",
                    order_desc: true,
                    query: null,
                    size: 10,
                    table: "nginx_access_abc",
                    title: "Widget 2",
                    type: 2,
                }
            ],
            tables,
            isLoading: false,
        });
    }

    async onSubmitForm() {
        const {dashboardDetail, widgetSelected} = this.state;
        const {id, title} = dashboardDetail;

        if (!title) {
            this.setState({
                errors: {
                    title: true,
                }
            });
            return;
        } else {
            this.setState({
                errors: {},
            })
        }
        ;

        const response = await DashboardActions.createOrUpdate(id, {
            title,
            widgets: [...widgetSelected].map(item => item.id),
        });

        if (response && !response.error) {
            Alert.success(`${id ? 'Update' : 'Add new' } successful`);
            if (response.redirect) {
                window.location.href = response.redirect;
                return;
            }

            this.setState({
                initialWidgetSelected: [...widgetSelected],
                initialData: {...dashboardDetail},
            })
        } else {
            Alert.error(response.error || 'Cant save new information');
        }

    }

    render() {
        const {
            widgetSelected,
            initialWidgetSelected,
            dashboardDetail,
            initialData,
            errors,
            widgetList,
            isLoading,
            tables
        } = this.state;

        const {title = '', description = '', table} = dashboardDetail;

        const widgetTable = table ? widgetList.filter(item => item.table === table) : [];
        const _columns = widgetTable.map((item, key) => <option key={key}
                                                                value={item.title}>{item.title}</option>);

        const isEditMode = initialData.title;

        const isDataChange = !isEqual(initialData, dashboardDetail) ||
            !isEqual(initialWidgetSelected.sort(), widgetSelected.sort());

        console.log(isDataChange);

        return (
            <div className="dashboard-management">
                {isLoading ? (<span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status" aria-hidden="true"></span>) : (<div className="card mr-2 ml-2">
                    <div className="card-header">
                        <span className="align-items-center d-inline-flex">
                            <h3 className="mb-0">{`${title || 'Create new dashboard'}`}</h3>
                        </span>
                    </div>
                    <div className="card-body">
                        <div className={`${isEditMode ? 'row' : ''}`}>
                            <FormField
                                className={`${isEditMode ? 'col-12 col-md-4' : ''}`}
                                label='Title'
                                placeholder='Dashboard title'
                                fieldName='title'
                                value={title}
                                onChange={(e) => this.onChangeData(e.target)}
                                isMandatory={true}
                                errors={errors}
                            />
                            <FormField
                                className={`${isEditMode ? 'col-12 col-md-4' : ''}`}
                                label='Description'
                                placeholder='Dashboard description'
                                fieldName='description'
                                value={description}
                                onChange={(e) => this.onChangeData(e.target)}
                            />
                            <FormField
                                className={`${isEditMode ? 'col-12 col-md-4' : ''}`}
                                label='Datatable'
                                value={table}
                                fieldName='table'
                                onChange={(e) => this.onChangeData(e.target)}
                                isMandatory={true}
                                type='select'
                                errors={errors}
                            >
                                <>
                                    <option value='' className='d-none'>{`Select table`}</option>
                                    {tables.map((item, index) => (
                                        <option value={item.value}
                                                key={index}
                                        >
                                            {item.label}
                                        </option>))}
                                </>
                            </FormField>
                        </div>
                        <div className="widget form-group">
                            <label>Widgets</label>
                            <Select2
                                id={'widget-selected'}
                                multiple="multiple"
                                disabled={!table}
                                data-placeholder={`${table ? 'Select widget' : 'Please select table first'}`}
                                value={widgetSelected && widgetSelected.length > 0 ? widgetSelected.map(item => item.title) : []}
                                onChange={() => {
                                    const summary = $('#widget-selected').val();
                                    const newWidgetList = summary.reduce((obj, item) => {
                                        const {dashboardDetail, widgetList} = this.state;
                                        const {table} = dashboardDetail;
                                        const widgetTable = table ? widgetList.filter(item => item.table === table) : [];
                                        const newWidget = [...widgetTable].find(el => el.title === item);
                                        if (newWidget) {
                                            obj.push({
                                                ...newWidget,
                                            });
                                        }
                                        return obj;
                                    }, []);

                                    this.setState({
                                        widgetSelected: [...newWidgetList],
                                    })
                                }}
                            >
                                {_columns}
                            </Select2>
                        </div>
                        <div className="d-inline-flex">
                            <Button className="btn-search mb-3"
                                    disabled={!isDataChange || Object.keys(errors).length > 0}
                                    onClick={() => this.onSubmitForm()}
                            >
                                Save
                            </Button>
                            {initialData.title &&
                            <Button className="btn-search mb-3 ml-2"
                                    data-toggle="collapse"
                                    data-target="#collapseEditableDashboard"
                                    aria-expanded="false"
                                    aria-controls="collapseEditableDashboard"
                                    color="default"
                            >
                                Cancel
                            </Button>}
                        </div>
                    </div>
                </div>)}
                {/*<ResponsiveGridLayout data={widgetSelected}/>*/}
            </div>
        );
    }
}

const root = document.querySelector('#root');
ReactDOM.render(<DashboardPage {...root.dataset}/>, root);
