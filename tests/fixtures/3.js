import { Button, Modal, Radio, Row } from 'antd';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { AppstoreOutlined, OrderedListOutlined } from '@ant-design/icons';

import { getRoot } from '../../store/selectors';
import SortableGrid from './components/sortable-grid';
import SortableList from './components/sortable-list';

import styles from './styles.css';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);

    result.splice(endIndex, 0, removed);

    return result;
};

const SortModal = ({ stories, isVisible, onClose, onConfirm }) => {
    const [cloneStories, setCloneStories] = useState(stories);
    const [viewType, setViewType] = useState('grid');
    const loading = useSelector(getRoot).orderLoading;
    const changeViewTypeHandler = (event) => setViewType(event.target.value);
    const changeSortHandler = (oldIndex, newIndex) => {
        setCloneStories(reorder(cloneStories, oldIndex, newIndex));
    };

    const confirmHandler = () => {
        const storiesIds = cloneStories.map(s => s.id);

        onConfirm(storiesIds);
    };

    return (
        <Modal
            title='Test'
            visible={isVisible}
            maskClosable={false}
            width={1000}
            style={{ top: 20 }}
            bodyStyle={{ height: '80vh', overflow: 'hidden' }}
            footer={[
                <Button key='cancel' data-marker='cancel-button' onClick={onClose}>
                    Отмена
                </Button>,
                <Button key='save' type='primary' data-marker='save-button' loading={loading} onClick={confirmHandler}>
                    Сохранить
                </Button>,
            ]}
            onCancel={onClose}>
            <Row justify='end'>
                <Radio.Group value={viewType} size='small' onChange={changeViewTypeHandler}>
                    <Radio.Button value='table'><OrderedListOutlined /></Radio.Button>
                    <Radio.Button value='grid'><AppstoreOutlined /></Radio.Button>
                </Radio.Group>
            </Row>
            <div className={styles.viewContainer}>
                {
                    viewType === 'table'
                        ? <SortableList list={cloneStories} onChangeSort={changeSortHandler} />
                        : <SortableGrid list={cloneStories} onChangeSort={changeSortHandler} />
                }
            </div>
        </Modal>
    );
};

SortModal.propTypes = {
    stories: PropTypes.array,
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
};

export default SortModal;