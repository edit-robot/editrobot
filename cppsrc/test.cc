#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <v8.h>
#include "StdAfx.h"
#include "Neurons.h"
#include "base_class.h"
#include "string_class.h"

using namespace v8;
using namespace std;

//转化为c++字符串
char* ToCString(const String::Utf8Value& value)
{
	return *value ? *value: "string conversion failed";
}

///////////////////////////////////////////////////////////////////////////////////////////////
Handle<Value> hello(const Arguments& args) {
	HandleScope scope;
	return scope.Close(String::New("hello,world,in nodecpp.node"));
}

Handle<Value> Add(const Arguments& args) {
    HandleScope scope;

    // 代表了可以传入 2 个以上的参数，但实际上我们只用前两个
    if(args.Length() < 2)
    {
        // 抛出错误
        ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));

        // 返回空值
        return scope.Close(Undefined());
    }

    // 若前两个参数其中一个不是数字的话
    if(!args[0]->IsNumber() || !args[1]->IsNumber())
    {
        // 抛出错误并返回空值
        ThrowException(Exception::TypeError(String::New("Wrong arguments")));
        return scope.Close(Undefined());
    }

    // 具体参考 v8 文档
    //     http://izs.me/v8-docs/classv8_1_1Value.html#a6eac2b07dced58f1761bbfd53bf0e366)
    // 的 `NumberValue` 函数
    Local<Number> num = Number::New(args[0]->NumberValue() + args[1]->NumberValue());

    return scope.Close(num);
}

Handle<Value> get_string(const Arguments& args) {
	HandleScope scope;
	
	String::Utf8Value str(args[0]);
	const char * pstr = ToCString(str);
	printf("%s\n",pstr);
	return scope.Close(String::New("hello,world,in nodecpp.node"));
}

Handle<Value> read_json(const Arguments& args) {

	// Create a stack-allocated handle scope.
	HandleScope handle_scope;

	// Create a new context.
	Persistent<Context> context = Context::New();

	// Enter the created context for compiling
	Context::Scope context_scope(context);

	// Create a string containing the JavaScript source code.
	Handle<String> source = String::New("var config={'Version':'1.0', 'Title':'HelloWorld', 'ThreadNum':'28'};");

	// Compile the source code.
	Handle<Script> script = Script::Compile(source);

	// Run the script to get the result.
	script->Run();


	// 读取Version配置
	Handle<v8::String> src1 = v8::String::New("config.Version;");
	Handle<Script> script1 = v8::Script::Compile(src1);
	Handle<Value> val1 = script1->Run();
	String::AsciiValue ascii1(val1);
	printf("%s\n", *ascii1);

	// 读取Title配置
	Handle<v8::String> src2 = v8::String::New("config.Title;");
	Handle<Script> script2 = v8::Script::Compile(src2);
	Handle<Value> val2 = script2->Run();
	String::Utf8Value ascii2(val2);
	printf("%s\n", *ascii2);

	// Dispose the persistent context.
	context.Dispose();

	return handle_scope.Close(String::New("hello,world,in nodecpp.node"));
}

//Handle：一个handle就是指向一个对象的指针。v8中所有的对象都是使用handle来进行访问，之所以用它是因为v8的垃圾回收器需要。
Handle<Value> Method(const Arguments& args) {

	//HandleScope：可以把它想象成是多个Handle的一个容器。
	HandleScope scope;

	//如果args的长度小于2，则抛出错误，从下面代码我们知道如何抛出一个错误，以后照搬就行	
	if (args.Length() < 2) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//返回Udefined
		return scope.Close(Undefined());
	}
	//判断2个参数是否是number
	if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}

	//将参数转化成C++可用的double型相加，然后再转化成输出给node的Number型，最后赋值给 Local<Number> 类型的变量 num，返回给用户	
	Local<Number> num = Number::New(args[0]->NumberValue() + args[1]->NumberValue());

	return scope.Close(num);
}

Handle<Value> Callback(const Arguments& args) {
	HandleScope scope;

	Local<Function> cb = Local<Function>::Cast(args[0]);
	const unsigned argc = 2;
	Local<Value> argv[argc] = { Local<Value>::New(String::New("RunCallback hello world")),Local<Value>::New(String::New("RunCallback hello world 2")) };
	cb->Call(Context::GetCurrent()->Global(), argc, argv);

	return scope.Close(Undefined());
}

///////////////////////////////////////////////////////////////////////////////////////////////
Handle<Value> travel_dir(const Arguments& args) {
	HandleScope scope;

	//如果args的长度小于2，则抛出错误，从下面代码我们知道如何抛出一个错误，以后照搬就行	
	if (args.Length() < 2) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//返回Udefined
		return scope.Close(Undefined());
	}
	//判断2个参数是否是number
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	String::Utf8Value str(args[0]);
	string_class *stringclass = new string_class();
	stringclass->set_str_from_file(ToCString(str));
	///////////////////////////////////////////////////////////////////////////////////////////////
	Local<Function> cb = Local<Function>::Cast(args[1]);
	const unsigned argc = 2;
	Local<Value> argv[argc] = { Local<Value>::New(String::New("")),Local<Value>::New(String::New("")) };
	cb->Call(Context::GetCurrent()->Global(), argc, argv);

	return scope.Close(Undefined());
}

// 初始化模块
void init(Handle<Object> exports, Handle<Object> module) {
	exports->Set(String::NewSymbol("hello"),
		FunctionTemplate::New(hello)->GetFunction());
	exports->Set(String::NewSymbol("Add"),
		FunctionTemplate::New(Add)->GetFunction());
	exports->Set(String::NewSymbol("get_string"),
		FunctionTemplate::New(get_string)->GetFunction());
	exports->Set(String::NewSymbol("read_json"),
		FunctionTemplate::New(read_json)->GetFunction());
	exports->Set(String::NewSymbol("nodecpp"),
		FunctionTemplate::New(Method)->GetFunction());
	exports->Set(String::NewSymbol("Callback"),
		FunctionTemplate::New(Callback)->GetFunction());
}

// 定义"nodecpp"模块
NODE_MODULE(nodecpp, init)

/* v8模板类Handle,Local,Persistent 管理Handle的类HandleScope,Context::Scope 将C++的数据传输给js
Local<RegExp>
Local<Object>
Local<Number>
Local<Integer>
Local<Value>
Local<String>
Local<Array>
Local<Function>
Local<Context>
Local<External>
Local<FunctionTemplate>
String::New("")
//新建个字符串
Array::New(n); //构建js数组，长度为n
NumberValue(); //将参数转化为double
IsString() //是存为字符串
ToString() //转化为字符串
IsBoolean() //是否为布尔值
ToBoolean() //转化为布尔值
IsNumber() //是否是数值
ToNumber() //转化为整形 V8 中，有两个模板 (Template) 类 ( 并非 C++ 中的模板类 )：
	对象模板 (ObjectTempalte) 和函数模板 (FunctionTemplate)，
	这两个模板类用以定义 JavaScript 对象和 JavaScript 函数。
	通过使用 ObjectTemplate，可以将 C++ 中的对象暴露给脚本环境， 类似的，FunctionTemplate 用以将 C++ 函数暴露给脚本环境，以供脚本使用
*/