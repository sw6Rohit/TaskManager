import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, Image, TextInput, Text, FlatList, Platform, StyleSheet, KeyboardAvoidingView, Keyboard } from "react-native";
import AddTaskForm from "./AddTaskForm";
import { axiosRequest } from "./utils/ApiRequest";
import Constant from "./utils/Constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from "./components/Checkbox";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Url from "./utils/Url";
import { showMessage } from "react-native-flash-message";
import TaskFilters from "./components/TaskFilters";
import { useNavigation } from "@react-navigation/native";

type ToDoType = {
    id: number;
    title: string;
    isDone: boolean;
};





const DashBoard = () => {
    const [searchQuery, setSearchQuery] = useState<any>("");
    const [taskModal, setTaskModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [todos, setTodos] = useState<ToDoType[]>([]);
    const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [toDate, setToDate] = useState(new Date());
    const [quickTaskTitle, setQuickTaskTitle] = useState('');
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 2); // subtract 2 days
        return date;
    });

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');

    const [task, setTask] = useState<any>();
    const [taskItems, setTaskItems] = useState<any>([]);
    const [agents, setAgents] = useState<any>([])

    const navigation = useNavigation();

    const handleAddTask = () => {
        Keyboard.dismiss();
        const params = {
            title: task,
            category: 66,

        }
        addTask(params)

        setTask(null);
    }


    const handleTextChange = (text: string) => {
        setTask(text);

        const lastAt = text.lastIndexOf('@');
        if (lastAt !== -1) {
            const mentionText = text.slice(lastAt + 1);
            setMentionQuery(mentionText);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            const textBeforeAt = task.slice(0, task.indexOf('@'));
        }
    };

    const handleSelectAgent = (agent: string) => {
        const lastAt = task.lastIndexOf('@');
        const newText = lastAt && task.slice(0, lastAt + 1) + agent + ' ';
        setTask(newText);
        setShowSuggestions(false);
    };

    const filteredAgents = agents.filter((agent: any) =>
        agent.AgentName.toLowerCase().includes(mentionQuery.toLowerCase())
    );



    useEffect(() => {
        getProjectList();
    }, [])
    const getProjectList = async () => {
        try {
            const param = {
                "UserId": -1,
                "TaskId": -1
            };
            await axiosRequest(Url.GET_PROJECTLIST, Constant.API_REQUEST_METHOD.POST, param)
                .then(({ data }) => {
                    const { userList } = data;
                    setAgents(userList)
                    console.log(userList);
                })
        } catch (error) {
            console.log(error);
        }
    }



    const toggleTaskModal = () => {
        setTaskModal(pre => !pre)
    };
    const onSearch = (query: string) => {
        if (query === "") {
            setTodos(oldTodos);
        }
        else {
            // const filteredTodos = oldTodos.filter((todo) =>
            //   todo?.taskTitle?.toLowerCase().includes(query.toLowerCase())
            // );
            // setTodos(filteredTodos);
        }
    };

    const addTask = async (values: any) => {
        console.log(values);
        const param = {
            "taskTitle": values?.title,
            "taskDescription": "Description of task",
            "projectId": 44,
            "taskCategoryId": values?.category,
            "responsiblePersonId": 100167,
            "taskCreatorId": 100167,
            "taskOwnerId": 27,
            "taskObserverId": "",
            "taskParticipantsId": "",
            "startDatetime": "2025-05-14 23:31:31",
            "finishDatetime": "2025-07-14 23:31:31",
            "duaration": "10",
            "statusFlag": 0,
            "taskStageId": 1,
            "ratePerTask": 25,
            "unitofTask": 1,
            "priorityId": 2,
            "actualPoint": "25",
            "taskTypeId": 1,
            "dueDateTypeId": 0,
            "taskFilePath": ""
        }

        await axiosRequest('Url.ADD_TASK', Constant.API_REQUEST_METHOD.POST, param)
            .then(({ data }) => {
                console.log(data);

                if (data) {

                    showMessage({ message: "Task Saved", type: 'success' });
                    // navigation.goBack();
                } else {
                    showMessage({ message: "Something Went Wrong", type: 'danger' });
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            });

        try {
            const newTodo = {
                id: Math.random(),
                title: values?.title,
                isDone: false,
            };
            const updatedTodos = [...todos, newTodo];
            setTodos(updatedTodos);
            setOldTodos(updatedTodos);
            await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
            // Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDone = async (id: number) => {
        try {
            const newTodos = todos.map((todo) => {
                if (todo.id === id) {
                    todo.isDone = !todo.isDone;
                }
                return todo;
            });
            // await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
            // setTodos(newTodos);
            // setOldTodos(newTodos);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {

        getTodos();
    }, []);

    const getTodos = async () => {
        try {
            const param = {
                fromDate: moment(fromDate).format('YYYY-MM-DDThh:mm:ss'),//'2025-05-01T10:10:10',
                toDate: moment(toDate).format('YYYY-MM-DDThh:mm:ss')
            }
            console.log(param);

            const getTaskApi = await axiosRequest(Url.GET_TASK, Constant.API_REQUEST_METHOD.GET, param)
                .then(({ data }) => {
                    // console.log(data);
                    setOldTodos(data)
                    setTodos(data)

                })
        } catch (error) {
            console.log(error);
        }
    };


    const deleteTodo = async (id: number) => {
        try {
            const newTodos = todos.filter((todo) => todo.id !== id);
            await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
            setTodos(newTodos);
            setOldTodos(newTodos);
        } catch (error) {
            console.log(error);
        }
    };

    const ToDoItem = ({
        todo,
        deleteTodo,
        handleDone,
    }: {
        todo: ToDoType;
        deleteTodo: (id: number) => void;
        handleDone: (id: number) => void;
    }) => (
        <View style={styles.todoContainer}>
            <View style={styles.todoInfoContainer}>
                <Checkbox
                    checked={todo.isDone}
                    onPress={() => handleDone(todo.id)}
                />
                <Text
                    style={[
                        styles.todoText,
                        todo.isDone && { textDecorationLine: "line-through" },
                    ]}
                >
                    {todo.taskTitle}
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    deleteTodo(todo.id);
                    Alert("Deleted " + todo.id);
                }}
            ></TouchableOpacity>
        </View>
    );

    return (
        <View style={{ marginTop: 40, flex: 1, backgroundColor: '#fff' }}>
            {taskModal ? <AddTaskForm onSubmit={(values: any) => { addTask(values); toggleTaskModal() }}
                onClose={() => toggleTaskModal()} />
                :
                <>
                    <View style={{}}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => Alert("Clicked!")}></TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate("TaskSummary")}>
                                <Image
                                    source={{ uri: "https://xsgames.co/randomusers/avatar.php?g=male" }}
                                    style={{ width: 40, height: 40, borderRadius: 20 }}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                            <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateButton}>
                                <Text>From: {moment(fromDate).format('DD-MMM-YYYY')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateButton}>
                                <Text>To: {moment(toDate).format('DD-MMM-YYYY')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={getTodos} style={[styles.dateButton, { backgroundColor: '#0078D4' }]}>
                                <Text style={{ color: '#fff' }}>Filter</Text>
                            </TouchableOpacity>
                        </View>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.writeTaskWrapper}
                        >
                            <TextInput
                                style={styles.input}
                                placeholder={'Write a task'}
                                value={task}
                                onChangeText={handleTextChange}
                            />
                            <TouchableOpacity onPress={() => console.log('Submit task')}>
                                <View style={styles.addWrapper}>
                                    <Text style={styles.addText}>+</Text>
                                </View>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>

                        {showSuggestions && mentionQuery.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                <FlatList
                                    data={filteredAgents}
                                    keyExtractor={(item) => item.AgentId.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleSelectAgent(item.AgentName)}>
                                            <Text style={styles.suggestionItem}>{item.AgentName}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}
                        <TaskFilters taskList={oldTodos} />
                    </View>

                    {showFromDatePicker && (
                        <DateTimePicker
                            value={fromDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, date) => {
                                setShowFromDatePicker(Platform.OS === 'ios');
                                if (date) setFromDate(date);
                            }}
                        />
                    )}

                    {showToDatePicker && (
                        <DateTimePicker
                            value={toDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, date) => {
                                setShowToDatePicker(Platform.OS === 'ios');
                                if (date) setToDate(date);
                            }}
                        />
                    )}

                    <TouchableOpacity style={styles.addButton} onPress={toggleTaskModal}>
                        <Text style={styles.plusText}>+</Text>
                    </TouchableOpacity>
                </>}

        </View>
    )
}

export default DashBoard

const styles = StyleSheet.create({
    // container: {
    //   padding: 10,
    // },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    nodeText: {
        fontSize: 14,
        marginVertical: 4,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        flex: 1,
        color: '#000'
    },
    label: {
        marginBottom: 6,
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
    },

    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    addButton: {
        position: 'absolute',
        bottom: 70,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0078D4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        // elevation: 8,
    },
    plusText: {
        color: '#fff',
        fontSize: 40,
        lineHeight: 46,
        fontWeight: 'bold',
        elevation: 8,
    },
    todoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
    },
    todoInfoContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    todoText: {
        fontSize: 16,
        color: "#333",
    },
    searchBar: {
        flexDirection: "row",
        backgroundColor: "#fff",
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 16 : 8,
        borderRadius: 10,
        gap: 10,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginHorizontal: 5,
    },
    writeTaskWrapper: {
        // position: 'absolute',
        // bottom: 60,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    input: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        borderRadius: 60,
        borderColor: '#C0C0C0',
        borderWidth: 1,
        width: 250,
    },
    addWrapper: {
        width: 60,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#C0C0C0',
        borderWidth: 1,
    },
    addText: {},
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        position: 'absolute',
        top: 170,
        left: 10,
        right: 10,
        maxHeight: 150,
        borderRadius: 6,
        zIndex: 999,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});