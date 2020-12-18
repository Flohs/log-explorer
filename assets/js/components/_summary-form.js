import React, {Component} from 'react';
import {Button, Select2} from '.';
import PropTypes from 'prop-types';
import {Alert, LogViewActions} from '../actions';

export class SummaryForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logViewUuid: '',
            columns: {},
            summary: []
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {columns = [], summary = []} = this.props;
        const preColumns = prevProps.columns ? prevProps.columns : [];
        const preSummary = prevProps.summary ? prevProps.summary : [];
        if (columns.length !== preColumns.length || summary.length !== preSummary.length) {
            const arrColumn = {};
            for (const i in columns) {
                arrColumn[columns[i].id] = columns[i].title;
            }

            const arrSummary = [];
            for (const i in summary) {
                arrSummary.push(summary[i].id);
            }

            this.setState({
                columns: arrColumn,
                summary: arrSummary
            });
        }
    }

    onSubmit() {
        const {logViewUuid} = this.props;
        const summary = $('#summary').val();
        if (logViewUuid) {
            LogViewActions.setSummary(logViewUuid, {columns: summary})
                .then(res => {
                    const {error} = res;
                    if (error) {
                        return;
                    }

                    Alert.success('Update successful');
                });
        }
    }

    render() {
        const {className} = this.props;
        const {summary, columns} = this.state;

        const _columns = Object.keys(columns).map((key, index) => {
            return <option key={index} value={key}>{columns[key]}</option>;
        });

        return (
            <div className={className}>
                <div className="form-group">
                    <Select2 id={'summary'} multiple="multiple" data-placeholder="Select summary column" value={summary}>
                        {_columns}
                    </Select2>
                </div>

                <div className="box-footer">
                    <Button color={'success'} onClick={this.onSubmit} >Save</Button>
                </div>
            </div>
        );
    }
}
SummaryForm.propTypes = {
    logViewUuid: PropTypes.string,
    columns: PropTypes.array,
    summary: PropTypes.array,
    className: PropTypes.string
};