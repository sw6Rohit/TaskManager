import { call, takeEvery, put } from 'redux-saga/effects'
import Axios from 'axios'
import { sagaActions } from './sagaActions'
import { fetchSideBarMenu } from '../slices/sideMenuSlice'
import { axiosRequest } from '../../utils/ApiRequest'
import Url from '../../utils/Url'
import Constant from '../../utils/Constant'
import { setUserData, registerUser, cleanUserData, userLogout, changepwd } from '../slices/userSlice'
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import * as RootNavigation from '../../navigation/RootNavigation';
import { setLanguage } from '../slices/languageSlice'
import { fetchDashboardMenuOptions } from '../slices/dashboardSlice'
import { setTheme } from '../slices/themeSlice'

interface ResponseGenerator {
    config?: any,
    data?: any,
    headers?: any,
    request?: any,
    status?: number,
    statusText?: string
}


export function* fetchSideBarSaga(action: any) {
    try {
        const { params } = action.payload;
        yield put(fetchSideBarMenu({ loading: true }))
        const result: ResponseGenerator = yield call(() =>
            axiosRequest('Url.SIDE_MENU', Constant.API_REQUEST_METHOD.GET,params)
        )
        yield put(fetchSideBarMenu({ res: result.data, loading: false }))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* postUserRegistrationSaga(action: any) {
    try {
        const { params } = action.payload;
        yield put(registerUser({ loading: true, error: null }))
        const response: ResponseGenerator = yield call(() =>
            axiosRequest('Url.REGISTRATION', Constant.API_REQUEST_METHOD.POST, params)
        )
        const { data } = response;
        if (data?.isSuccess === "True") {
            showMessage({
                message: data?.msg,
                type: 'success',
            });

            yield put(registerUser({ loading: false, error: null }))
            RootNavigation.navigationRef.goBack();

        } else {

            yield put(registerUser({ loading: false, error: null }))
            showMessage({
                message: data?.msg,
                type: 'danger',
            });
        }

    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* updateUserProfileSaga(action: any) {
    try {
        const { params } = action.payload;
        yield put(registerUser({ loading: true, error: null }))
        const response: ResponseGenerator = yield call(() =>
            axiosRequest('Url.REGISTRATION', Constant.API_REQUEST_METHOD.POST, params)
        )
        const { data } = response;
        if (data?.isSuccess === "True") {
            showMessage({
                message: data?.msg,
                type: 'success',
            });
            yield put(registerUser({ loading: false, error: null }))
            RootNavigation.navigationRef.goBack();
        } else {
            yield put(registerUser({ loading: false, error: null }))
            showMessage({
                message: data?.msg,
                type: 'danger',
            });
        }

    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}


export function* fetchUserDataSaga(action: any) {
    try {


        const { params } = action.payload;
        yield put(setUserData({ loading: true }))

        const result: ResponseGenerator = yield call(() =>
            axiosRequest(Url.LOGIN, Constant.API_REQUEST_METHOD.POST, params)
        )

        yield put(setUserData({ res: result.data, loading: false }))

    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* clearUserDataSaga() {
    try {
        yield put(cleanUserData({}))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* userLogoutSaga() {
    try {
        yield put(userLogout({}))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* changepwdSaga(action: any) {
    try {
        const { params } = action.payload;
        yield put(changepwd({ loading: true, error: null }))
        const response: ResponseGenerator = yield call(() =>
            axiosRequest('Url.CHANGE_PASSWORD', Constant.API_REQUEST_METHOD.POST, params)
        )
        const { data } = response;
        if (data?.isSuccess === "True") {
            showMessage({
                message: data?.msg,
                type: 'success',
            });
            yield put(changepwd({ loading: false, error: null }))
            RootNavigation.navigationRef.goBack();
        } else {
            yield put(changepwd({ loading: false, error: null }))
            showMessage({
                message: data?.msg,
                type: 'danger',
            });
        }

    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}

export function* changeLanguage(action: any) {
    try {
        const { params } = action.payload;
        yield put(setLanguage({}))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}


export function* fetchDashboardOptionsSaga() {
    try {
        yield put(fetchDashboardMenuOptions({ loading: true }))
        const result: ResponseGenerator = yield call(() =>
            axiosRequest('Url.DASHBOARD_MENU', Constant.API_REQUEST_METHOD.GET)
        )
        yield put(fetchDashboardMenuOptions({ res: result.data, loading: false }))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}


export function* changeTheme(action: any) {
    console.log(action)
    try {
        const { theme } = action;
        yield put(setTheme(theme))
    } catch (e) {
        yield put({ type: 'FAILED' })
    }
}


export default function* rootSaga() {
    yield takeEvery(sagaActions.FETCH_SIDE_BAR_MENU, fetchSideBarSaga)
    yield takeEvery(sagaActions.FETCH_USER_DATA, fetchUserDataSaga)
    yield takeEvery(sagaActions.POST_REGISTRATION_DATA, postUserRegistrationSaga)
    yield takeEvery(sagaActions.USER_LOGOUT, userLogoutSaga)
    yield takeEvery(sagaActions.CHANGE_PASSWORD, changepwdSaga)
    yield takeEvery(sagaActions.CHANGE_LANGUAGE, changeLanguage)
    yield takeEvery(sagaActions.DASHBOARD_MENU_OPTIONS, fetchDashboardOptionsSaga)
    yield takeEvery(sagaActions.SELECT_THEME, changeTheme)
}

