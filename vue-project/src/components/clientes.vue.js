import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const isRegistering = ref(false);
const isLoggedIn = ref(false);
const loading = ref(false);
const profileMenuOpen = ref(false);
const showPassword = ref(false);
const showRegPassword = ref(false);
const showNewPassword = ref(false);
const showNewPasswordConfirm = ref(false);
const email = ref('');
const password = ref('');
const regNombre = ref('');
const regEmail = ref('');
const regPassword = ref('');
const errorMessage = ref('');
const verificationPending = ref(false);
const usuario = ref({});
const recoveryStep = ref(0);
const recoveryEmail = ref('');
const recoveryCode = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');
const passwordStrength = computed(() => {
    const pass = regPassword.value;
    if (!pass) {
        return {
            score: 0,
            text: '',
            colorClass: ''
        };
    }
    let score = 0;
    if (pass.length >= 6)
        score++;
    if (pass.length >= 10)
        score++;
    if (/[A-Z]/.test(pass))
        score++;
    if (/[0-9]/.test(pass))
        score++;
    if (/[^A-Za-z0-9]/.test(pass))
        score++;
    if (score <= 2) {
        return {
            score: 1,
            text: 'No segura',
            colorClass: 'weak'
        };
    }
    if (score <= 4) {
        return {
            score: 2,
            text: 'Aceptable',
            colorClass: 'medium'
        };
    }
    return {
        score: 3,
        text: 'Muy segura',
        colorClass: 'strong'
    };
});
onMounted(() => {
    const sesion = localStorage.getItem('sesion_usuario');
    const token = localStorage.getItem('token');
    if (sesion && token) {
        try {
            usuario.value = JSON.parse(sesion);
            isLoggedIn.value = true;
        }
        catch {
            handleLogout();
        }
    }
});
const resetErrorAndSwitch = (targetState) => {
    errorMessage.value = '';
    verificationPending.value = false;
    isRegistering.value = targetState;
    recoveryStep.value = 0;
    profileMenuOpen.value = false;
    showPassword.value = false;
    showRegPassword.value = false;
    showNewPassword.value = false;
    showNewPasswordConfirm.value = false;
};
const handleRegister = async () => {
    loading.value = true;
    errorMessage.value = '';
    verificationPending.value = false;
    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: regNombre.value.trim(),
                email: regEmail.value.trim().toLowerCase(),
                password: regPassword.value
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorMessage.value = data.error || 'Error al registrarse';
            // El backend ya valida el nombre de usuario sin distinguir mayúsculas/minúsculas.
            if (res.status === 400 && /nombre de usuario ya está en uso/i.test(data.error || '')) {
                errorMessage.value = 'Este nombre de usuario ya esta en uso';
            }
            return;
        }
        verificationPending.value = true;
        errorMessage.value =
            data.message || 'Registro creado. Revisa tu correo para verificar la cuenta.';
    }
    catch {
        errorMessage.value = 'Error de conexión con el servidor';
    }
    finally {
        loading.value = false;
    }
};
const handleLogin = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value.trim().toLowerCase(),
                password: password.value
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorMessage.value = data.error || 'Error al iniciar sesión';
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('sesion_usuario', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-changed'));
        usuario.value = data.user;
        isLoggedIn.value = true;
        profileMenuOpen.value = false;
        goToDashboard();
    }
    catch {
        errorMessage.value = 'Error de conexión con el servidor';
    }
    finally {
        loading.value = false;
    }
};
const openRecovery = () => {
    errorMessage.value = '';
    recoveryEmail.value = email.value.trim().toLowerCase();
    recoveryCode.value = '';
    newPassword.value = '';
    newPasswordConfirm.value = '';
    recoveryStep.value = 1;
};
const cancelRecovery = () => {
    recoveryStep.value = 0;
    errorMessage.value = '';
    recoveryCode.value = '';
    newPassword.value = '';
    newPasswordConfirm.value = '';
};
const requestRecoveryCode = async () => {
    if (!recoveryEmail.value.trim()) {
        errorMessage.value = 'Ingresá tu correo electrónico.';
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`${API}/olvide-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: recoveryEmail.value.trim().toLowerCase()
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorMessage.value = data.error || 'No se pudo enviar el código.';
            return;
        }
        recoveryStep.value = 2;
        errorMessage.value = '';
    }
    catch {
        errorMessage.value = 'Error de conexión con el servidor.';
    }
    finally {
        loading.value = false;
    }
};
const verifyRecoveryCode = async () => {
    if (!recoveryCode.value.trim()) {
        errorMessage.value = 'Ingresá el código que recibiste.';
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await fetch(`${API}/verificar-codigo-recuperacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: recoveryEmail.value.trim().toLowerCase(),
                codigo: recoveryCode.value.trim()
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorMessage.value = data.error || 'Código incorrecto o vencido.';
            return;
        }
        recoveryStep.value = 3;
    }
    catch {
        errorMessage.value = 'Error de conexión con el servidor.';
    }
    finally {
        loading.value = false;
    }
};
const resetPassword = async () => {
    errorMessage.value = '';
    if (newPassword.value.length < 6) {
        errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.';
        return;
    }
    if (newPassword.value !== newPasswordConfirm.value) {
        errorMessage.value = 'Las contraseñas no coinciden.';
        return;
    }
    loading.value = true;
    try {
        const res = await fetch(`${API}/restablecer-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: recoveryEmail.value.trim().toLowerCase(),
                codigo: recoveryCode.value.trim(),
                password: newPassword.value
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorMessage.value = data.error || 'No se pudo cambiar la contraseña.';
            return;
        }
        recoveryStep.value = 0;
        email.value = recoveryEmail.value;
        password.value = '';
        recoveryEmail.value = '';
        recoveryCode.value = '';
        newPassword.value = '';
        newPasswordConfirm.value = '';
        alert('Contraseña cambiada correctamente. Ahora podés iniciar sesión.');
    }
    catch {
        errorMessage.value = 'Error de conexión con el servidor.';
    }
    finally {
        loading.value = false;
    }
};
const goToDashboard = () => {
    profileMenuOpen.value = false;
    router.push('/ventas');
};
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('sesion_usuario');
    window.dispatchEvent(new Event('auth-changed'));
    usuario.value = {};
    isLoggedIn.value = false;
    profileMenuOpen.value = false;
    email.value = '';
    password.value = '';
    resetErrorAndSwitch(false);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['verification-box']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-text']} */ ;
/** @type {__VLS_StyleScopedClasses['weak']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-text']} */ ;
/** @type {__VLS_StyleScopedClasses['medium']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-text']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['user-icon-button']} */ ;
/** @type {__VLS_StyleScopedClasses['user-icon-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['logged-user-area']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "auth-container" },
});
if (__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn) {
    // @ts-ignore
    [isRegistering, isLoggedIn,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleRegister) },
        ...{ class: "auth-form" },
    });
    // @ts-ignore
    [handleRegister,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.regNombre),
        type: "text",
        placeholder: "Nombre de usuario",
        maxlength: "150",
        required: true,
    });
    // @ts-ignore
    [regNombre,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
        placeholder: "Correo electrónico",
        required: true,
    });
    (__VLS_ctx.regEmail);
    // @ts-ignore
    [regEmail,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group password-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: (__VLS_ctx.showRegPassword ? 'text' : 'password'),
        placeholder: "Contraseña",
        minlength: "6",
        required: true,
    });
    (__VLS_ctx.regPassword);
    // @ts-ignore
    [showRegPassword, regPassword,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.showRegPassword = !__VLS_ctx.showRegPassword;
                // @ts-ignore
                [showRegPassword, showRegPassword,];
            } },
        ...{ class: "eye-icon" },
    });
    (__VLS_ctx.showRegPassword ? '🙈' : '👁️');
    // @ts-ignore
    [showRegPassword,];
    if (__VLS_ctx.regPassword) {
        // @ts-ignore
        [regPassword,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "strength-meter" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "strength-bar-bg" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "strength-bar-fill" },
            ...{ class: (__VLS_ctx.passwordStrength.colorClass) },
        });
        // @ts-ignore
        [passwordStrength,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "strength-text" },
            ...{ class: (__VLS_ctx.passwordStrength.colorClass) },
        });
        // @ts-ignore
        [passwordStrength,];
        (__VLS_ctx.passwordStrength.text);
        // @ts-ignore
        [passwordStrength,];
    }
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading,];
    (__VLS_ctx.loading ? 'Registrando...' : 'Registrarse');
    // @ts-ignore
    [loading,];
    const __VLS_0 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        name: "fade",
    }));
    const __VLS_2 = __VLS_1({
        name: "fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_4 } = __VLS_3.slots;
    if (__VLS_ctx.errorMessage && !__VLS_ctx.verificationPending) {
        // @ts-ignore
        [errorMessage, verificationPending,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "error-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
    }
    var __VLS_3;
    const __VLS_5 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        name: "fade",
    }));
    const __VLS_7 = __VLS_6({
        name: "fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_9 } = __VLS_8.slots;
    if (__VLS_ctx.verificationPending) {
        // @ts-ignore
        [verificationPending,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "verification-box" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.errorMessage || 'Cuenta creada correctamente.');
        // @ts-ignore
        [errorMessage,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.regEmail);
        // @ts-ignore
        [regEmail,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                        return;
                    if (!(__VLS_ctx.verificationPending))
                        return;
                    __VLS_ctx.resetErrorAndSwitch(false);
                    // @ts-ignore
                    [resetErrorAndSwitch,];
                } },
            type: "button",
            ...{ class: "btn btn-small" },
        });
    }
    var __VLS_8;
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.resetErrorAndSwitch(false);
                // @ts-ignore
                [resetErrorAndSwitch,];
            } },
        ...{ class: "switch" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "highlight" },
    });
}
else if (!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0) {
    // @ts-ignore
    [isLoggedIn, recoveryStep,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleLogin) },
        ...{ class: "auth-form" },
    });
    // @ts-ignore
    [handleLogin,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
        placeholder: "Correo electrónico",
        required: true,
    });
    (__VLS_ctx.email);
    // @ts-ignore
    [email,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group password-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: (__VLS_ctx.showPassword ? 'text' : 'password'),
        placeholder: "Contraseña",
        required: true,
    });
    (__VLS_ctx.password);
    // @ts-ignore
    [showPassword, password,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                if (!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0))
                    return;
                __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
                // @ts-ignore
                [showPassword, showPassword,];
            } },
        ...{ class: "eye-icon" },
    });
    (__VLS_ctx.showPassword ? '🙈' : '👁️');
    // @ts-ignore
    [showPassword,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading,];
    (__VLS_ctx.loading ? 'Ingresando...' : 'Iniciar Sesión');
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.openRecovery) },
        type: "button",
        ...{ class: "forgot-link" },
    });
    // @ts-ignore
    [openRecovery,];
    const __VLS_10 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        name: "fade",
    }));
    const __VLS_12 = __VLS_11({
        name: "fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_14 } = __VLS_13.slots;
    if (__VLS_ctx.errorMessage) {
        // @ts-ignore
        [errorMessage,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "error-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
    }
    var __VLS_13;
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                if (!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0))
                    return;
                __VLS_ctx.resetErrorAndSwitch(true);
                // @ts-ignore
                [resetErrorAndSwitch,];
            } },
        ...{ class: "switch" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "highlight" },
    });
}
else if (!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 1) {
    // @ts-ignore
    [isLoggedIn, recoveryStep,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.requestRecoveryCode) },
        ...{ class: "auth-form" },
    });
    // @ts-ignore
    [requestRecoveryCode,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "email",
        placeholder: "Correo registrado",
        required: true,
    });
    (__VLS_ctx.recoveryEmail);
    // @ts-ignore
    [recoveryEmail,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading,];
    (__VLS_ctx.loading ? 'Enviando...' : 'Enviar código');
    // @ts-ignore
    [loading,];
    if (__VLS_ctx.errorMessage) {
        // @ts-ignore
        [errorMessage,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "error-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
    }
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ onClick: (__VLS_ctx.cancelRecovery) },
        ...{ class: "switch" },
    });
    // @ts-ignore
    [cancelRecovery,];
}
else if (!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 2) {
    // @ts-ignore
    [isLoggedIn, recoveryStep,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.verifyRecoveryCode) },
        ...{ class: "auth-form" },
    });
    // @ts-ignore
    [verifyRecoveryCode,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.recoveryCode),
        type: "text",
        inputmode: "numeric",
        maxlength: "6",
        placeholder: "Código de 6 dígitos",
        autocomplete: "one-time-code",
        required: true,
    });
    // @ts-ignore
    [recoveryCode,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading,];
    (__VLS_ctx.loading ? 'Verificando...' : 'Verificar código');
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.requestRecoveryCode) },
        type: "button",
        ...{ class: "forgot-link" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading, requestRecoveryCode,];
    if (__VLS_ctx.errorMessage) {
        // @ts-ignore
        [errorMessage,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "error-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
    }
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ onClick: (__VLS_ctx.cancelRecovery) },
        ...{ class: "switch" },
    });
    // @ts-ignore
    [cancelRecovery,];
}
else if (!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 3) {
    // @ts-ignore
    [isLoggedIn, recoveryStep,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-card" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "auth-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({});
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.resetPassword) },
        ...{ class: "auth-form" },
    });
    // @ts-ignore
    [resetPassword,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group password-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: (__VLS_ctx.showNewPassword ? 'text' : 'password'),
        placeholder: "Nueva contraseña",
        minlength: "6",
        required: true,
    });
    (__VLS_ctx.newPassword);
    // @ts-ignore
    [showNewPassword, newPassword,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 1))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 2))
                    return;
                if (!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 3))
                    return;
                __VLS_ctx.showNewPassword = !__VLS_ctx.showNewPassword;
                // @ts-ignore
                [showNewPassword, showNewPassword,];
            } },
        ...{ class: "eye-icon" },
    });
    (__VLS_ctx.showNewPassword ? '🙈' : '👁️');
    // @ts-ignore
    [showNewPassword,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "input-group password-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: (__VLS_ctx.showNewPasswordConfirm ? 'text' : 'password'),
        placeholder: "Repetir nueva contraseña",
        minlength: "6",
        required: true,
    });
    (__VLS_ctx.newPasswordConfirm);
    // @ts-ignore
    [showNewPasswordConfirm, newPasswordConfirm,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 1))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 2))
                    return;
                if (!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 3))
                    return;
                __VLS_ctx.showNewPasswordConfirm = !__VLS_ctx.showNewPasswordConfirm;
                // @ts-ignore
                [showNewPasswordConfirm, showNewPasswordConfirm,];
            } },
        ...{ class: "eye-icon" },
    });
    (__VLS_ctx.showNewPasswordConfirm ? '🙈' : '👁️');
    // @ts-ignore
    [showNewPasswordConfirm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading),
    });
    // @ts-ignore
    [loading,];
    (__VLS_ctx.loading ? 'Guardando...' : 'Cambiar contraseña');
    // @ts-ignore
    [loading,];
    if (__VLS_ctx.errorMessage) {
        // @ts-ignore
        [errorMessage,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "error-message" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
        (__VLS_ctx.errorMessage);
        // @ts-ignore
        [errorMessage,];
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "logged-user-area" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isRegistering && !__VLS_ctx.isLoggedIn))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 0))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 1))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 2))
                    return;
                if (!!(!__VLS_ctx.isLoggedIn && __VLS_ctx.recoveryStep === 3))
                    return;
                __VLS_ctx.profileMenuOpen = !__VLS_ctx.profileMenuOpen;
                // @ts-ignore
                [profileMenuOpen, profileMenuOpen,];
            } },
        ...{ class: "user-icon-button" },
        'aria-label': "Abrir menú de usuario",
    });
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6Z",
    });
    const __VLS_15 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    Transition;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        name: "menu",
    }));
    const __VLS_17 = __VLS_16({
        name: "menu",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const { default: __VLS_19 } = __VLS_18.slots;
    if (__VLS_ctx.profileMenuOpen) {
        // @ts-ignore
        [profileMenuOpen,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "profile-menu" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "profile-menu-header" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mini-avatar" },
        });
        ((__VLS_ctx.usuario.nombre || 'U').charAt(0).toUpperCase());
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.usuario.nombre);
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
        (__VLS_ctx.usuario.email);
        // @ts-ignore
        [usuario,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.goToDashboard) },
            ...{ class: "profile-action" },
        });
        // @ts-ignore
        [goToDashboard,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            ...{ class: "profile-action logout-action" },
        });
        // @ts-ignore
        [handleLogout,];
    }
    var __VLS_18;
}
/** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-meter']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['verification-box']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['switch']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['eye-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['logged-user-area']} */ ;
/** @type {__VLS_StyleScopedClasses['user-icon-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-action']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-action']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        isRegistering: isRegistering,
        isLoggedIn: isLoggedIn,
        loading: loading,
        profileMenuOpen: profileMenuOpen,
        showPassword: showPassword,
        showRegPassword: showRegPassword,
        showNewPassword: showNewPassword,
        showNewPasswordConfirm: showNewPasswordConfirm,
        email: email,
        password: password,
        regNombre: regNombre,
        regEmail: regEmail,
        regPassword: regPassword,
        errorMessage: errorMessage,
        verificationPending: verificationPending,
        usuario: usuario,
        recoveryStep: recoveryStep,
        recoveryEmail: recoveryEmail,
        recoveryCode: recoveryCode,
        newPassword: newPassword,
        newPasswordConfirm: newPasswordConfirm,
        passwordStrength: passwordStrength,
        resetErrorAndSwitch: resetErrorAndSwitch,
        handleRegister: handleRegister,
        handleLogin: handleLogin,
        openRecovery: openRecovery,
        cancelRecovery: cancelRecovery,
        requestRecoveryCode: requestRecoveryCode,
        verifyRecoveryCode: verifyRecoveryCode,
        resetPassword: resetPassword,
        goToDashboard: goToDashboard,
        handleLogout: handleLogout,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
