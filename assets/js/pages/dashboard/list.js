import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Alert, DashboardActions, WidgetActions} from "../../actions";
import {Button, CardHeader, Colors, Icon, Link, Modal, Size, Table} from "../../components";

class DashboardList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboards: [],
            dashboardSelected: null,
        };
    }

    componentDidMount() {
        const that = this;
        DashboardActions.listDashboard()
            .then(res => {
                const {error, data} = res;
                if (error) {
                    return;
                }

                that.setState({
                    dashboards: data
                });
            });
    }

    deleteDashboard(key) {
        this.setState({
            dashboardSelected: key,
        })
    }

    deleteConfirmModal = (dashboards, dashboardSelected) => (
        <Modal
            id='delete-dashboard'
            title='Confirm Delete'
            children={`Are you sure you want to delete dashboard ${dashboards[dashboardSelected]?.title} ?`}
            saveButtonTitle='Delete'
            closeButtonTitle='Cancel'
            show={dashboardSelected || dashboardSelected === 0}
            saveButtonColor={Colors.red}
            size={Size.medium}
            showSaveButton={true}
            closeButtonAction={() => {
                this.setState({
                    dashboardSelected: false,
                })
            }}
            saveButtonAction={() => {
                try {
                    DashboardActions.deleteDashboard(dashboards[dashboardSelected].id)
                        .then(res => {
                            const {error} = res;
                            if (error) {
                                Alert.success('You cant deleted this dashboard');
                                return;
                            }

                            dashboards.splice(dashboardSelected, 1);
                            this.setState({dashboards}, () => {
                                Alert.success('Delete successful');
                            });
                        });
                } catch (e) {
                    Alert.error(e);
                } finally {
                    this.setState({
                        dashboardSelected: null,
                    })
                };
            }}
        />
    )

    render() {
        const {dashboards, dashboardSelected} = this.state;

        return (
            <div className="database">
                {this.deleteConfirmModal(dashboards, dashboardSelected)}
                <div className="card">
                    <CardHeader title="Dashboard list" showCollapseButton={false} showRemoveButton={false}>
                        <Link href={'/dashboard/create'} className={'btn btn-success'}>Create dashboard</Link>
                    </CardHeader>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12">
                                <Table>
                                    <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Last update</th>
                                        <th>&nbsp;</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dashboards.map((item, key) => {
                                        const url = '/dashboard/edit/' + item.id;
                                        return <tr key={key}>
                                            <td>{item.title}</td>
                                            <td>{item.last_updated}</td>
                                            <td>
                                                <Link href={`/dashboard/${item.uuid}`} className="btn btn-primary mr-2" ><Icon name={'eye'}/></Link>
                                                <Link href={url} className={'btn btn-success mr-2'}><Icon name={'edit'}/></Link>
                                                <Button onClick={e => this.deleteDashboard(key)} color={'danger'}><Icon name={'trash'}/></Button>
                                            </td>
                                        </tr>;
                                    })}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<DashboardList/>, document.querySelector('#root'));
