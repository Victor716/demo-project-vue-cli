<template>
  <div class="login">
    <div class="login-form">
      <el-form :rules="rules" :model="form" ref="form" label-width="80px">
        <el-form-item label="手机" prop="phone">
          <el-input placeholder="请输入手机" v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="请输入密码"
            v-model="form.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoginLoading" type="primary" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Form } from 'element-ui';
import { login } from '@/services/users'
export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: 18201288771,
        password: 111111
      },
      isLoginLoading: false,
      rules: {
        phone: [{
          required: true,
          message: '请输入手机号码',
          trigger: 'blur'
        }, {
          pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur'
        }],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }, {
          pattern: /^\d{6}$/, message: '长度6位', trigger: 'blur'
        }]
      }
    };
  },
  methods: {
    async onSubmit () {
      try {
        // 1. validation
        await (this.$refs.form as Form).validate()
        this.isLoginLoading = true;
        const { data } = await login(this.form as any)
        if (data.state !== 1) {
          return window.alert(data.message);
        } else {
          // 1. login successfully and store the login status globally (Vuex)
          this.$store.commit('setUser', data.content)
          // 2. login status should be checked before calling api (intercepter)
          this.$router.push(this.$route.query.redirect as string || '/');
          this.$message.success('Login successfully!');
        }
      } catch (error) {
        console.log('Login failed', error);
      }
      this.isLoginLoading = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  .login-form {
    background: #ffffff;
    padding: 20px;
  }
}
</style>
