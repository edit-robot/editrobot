#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <v8.h>
#include "class/StdAfx.h"
#include "class/Neurons.h"
#include "class/base_class.h"
#include "class/string_class.h"
#include "class/file_class.h"

using namespace v8;
using namespace std;

//ת��Ϊc++�ַ���
char* ToCString(const String::Utf8Value& value)
{
	return *value ? *value: "string conversion failed";
}
///////////////////////////////////////////////////////////////////////////////////////////////
Handle<Value> travel_dir(const Arguments& args) {
	HandleScope scope;

	// Create a new context.
	Persistent<Context> context = Context::New();
	// Enter the created context for compiling
	Context::Scope context_scope(context);
	
	//���args�ĳ���С��2�����׳����󣬴������������֪������׳�һ�������Ժ��հ����	
	if (args.Length() < 1) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//����Udefined
		return scope.Close(Undefined());
	}
	//�ж�2�������Ƿ���number
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}
	
	// Local<Function> cb = Local<Function>::Cast(args[1]);
	// const unsigned argc = 2;
	// Local<Value> argv[argc] = { Local<Value>::New(String::New("")),Local<Value>::New(String::New("")) };
	// cb->Call(Context::GetCurrent()->Global(), argc, argv);
	///////////////////////////////////////////////////////////////////////////////////////////////
	String::Utf8Value str(args[0]);
	string_class *Folder = new string_class();
	Folder->set_str(ToCString(str));
	Handle<String> source;
	//·��
    //printf("file path :%s\n",Folder->str);
	int file_number = 0;
    struct _finddata_t file;
	long k;
	long handle;
	k = handle = _findfirst( Folder->str, &file );
	while( k != -1 ){
        if((file.attrib != _A_NORMAL)&&(0 != strcmp(file.name, "."))&&(0 != strcmp(file.name, ".."))){
			printf("file :%s\n",file.name);
			
        }
		++file_number;
		k = _findnext( handle, &file );
	}
	_findclose( handle );
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	delete Folder;
	
	// Dispose the persistent context.
	context.Dispose();
	return scope.Close(Undefined());
}

Handle<Value> write_json_file(const Arguments& args) {
	//HandleScope�����԰���������Ƕ��Handle��һ��������
	HandleScope scope;

	//���args�ĳ���С��2�����׳����󣬴������������֪������׳�һ�������Ժ��հ����	
	if (args.Length() < 1) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//����Udefined
		return scope.Close(Undefined());
	}
	//�жϲ����Ƿ����ַ���
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}
	if (!args[1]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}

	String::Utf8Value str1(args[0]);
	String::Utf8Value str2(args[1]);
	
	string_class *file_path_string_class = new string_class();//�����ļ�·��
	string_class *file_content_string_class = new string_class();//�����ļ�����
	file_path_string_class->set_str(ToCString(str1));
	file_content_string_class->set_str(ToCString(str2));
	file_content_string_class->str_write_to_file(file_path_string_class->str);
	Local<Value> result = Local<Value>::New(String::New("true"));
	delete file_path_string_class;
	delete file_content_string_class;
	
	return scope.Close(result);
}

Handle<Value> read_json_file(const Arguments& args) {
	//HandleScope�����԰���������Ƕ��Handle��һ��������
	HandleScope scope;

	//���args�ĳ���С��2�����׳����󣬴������������֪������׳�һ�������Ժ��հ����	
	if (args.Length() < 1) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//����Udefined
		return scope.Close(Undefined());
	}
	//�жϲ����Ƿ����ַ���
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}

	String::Utf8Value str1(args[0]);
	string_class *file_string_class = new string_class();//�����ļ�����
	file_string_class->set_str_from_file(ToCString(str1));
	Local<Value> result = Local<Value>::New(String::New(file_string_class->str));
	delete file_string_class;
	
	return scope.Close(result);
}

Handle<Value> project_path(const Arguments& args) {
	//HandleScope�����԰���������Ƕ��Handle��һ��������
	HandleScope scope;

	//���args�ĳ���С��2�����׳����󣬴������������֪������׳�һ�������Ժ��հ����	
	if (args.Length() < 3) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//����Udefined
		return scope.Close(Undefined());
	}
	
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments 1")));
		return scope.Close(Undefined());
	}
	if (!args[1]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments 2")));
		return scope.Close(Undefined());
	}
	if (!args[2]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments 3")));
		return scope.Close(Undefined());
	}
	
	String::Utf8Value str1(args[0]);
	String::Utf8Value str2(args[1]);
	String::Utf8Value str3(args[2]);
	
	string_class *absolute_directory_string_class = new string_class();
	absolute_directory_string_class->set_str(ToCString(str1));//���þ���·��
	
	string_class *project_name_string_class = new string_class();
	project_name_string_class->set_str(ToCString(str2));//������Ŀ����
	
	string_class *path_Segmentation_string_class = new string_class();
	path_Segmentation_string_class->set_str(ToCString(str3));//����·��б��
	
	absolute_directory_string_class->split(path_Segmentation_string_class->str);
	char lock;
	do{
		if(!absolute_directory_string_class->pop_back()){
			lock = 0;
		}
		if(!strcmp(absolute_directory_string_class->pop_date,project_name_string_class->str)){
			lock = 1;
		}
		else{
			lock = 0;
			absolute_directory_string_class->pop_back();
		}
	}
	while(lock);
	absolute_directory_string_class->join("/");
	///////////////////////////////////////////////////////////////////////////////////////////////
	Local<Function> cb = Local<Function>::Cast(args[3]);
	const unsigned argc = 1;
	Local<Value> argv[argc] = { Local<Value>::New(String::New(absolute_directory_string_class->str))};
	cb->Call(Context::GetCurrent()->Global(), argc, argv);
	Local<Value> result = Local<Value>::New(String::New(absolute_directory_string_class->str));
	
	delete absolute_directory_string_class;
	delete project_name_string_class;
	delete path_Segmentation_string_class;
	
	return scope.Close(result);
}

Handle<Value> get_config_callback(const Arguments& args) {
	HandleScope scope;

	//���args�ĳ���С��2�����׳����󣬴������������֪������׳�һ�������Ժ��հ����	
	if (args.Length() < 2) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		//����Udefined
		return scope.Close(Undefined());
	}
	//�ж�2�������Ƿ���number
	if (!args[0]->IsString()) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close(Undefined());
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	String::Utf8Value str(args[0]);
	string_class *json_config_stringclass = new string_class();
	string_class *stringclass = new string_class();
	stringclass->set_str_from_file(ToCString(str));
	json_config_stringclass->push_back("var config=");
	json_config_stringclass->push_back(stringclass->str);
	delete stringclass;
	json_config_stringclass->join("");
	//printf("%s",json_config_stringclass->str);
	
	// Create a new context.
	Persistent<Context> context = Context::New();
	// Enter the created context for compiling
	Context::Scope context_scope(context);
	
	// Create a string containing the JavaScript source code.
	Handle<String> source = String::New(json_config_stringclass->str);
	// Compile the source code.
	Handle<Script> script = Script::Compile(source);
	// Run the script to get the result.
	script->Run();
	
	//������ת��Ϊjson�ַ���
	// Handle<Value> valtemp = Script::Compile(String::New("JSON.stringify(config);"))->Run();
	// String::Utf8Value valtempUtf8(valtemp);
	// printf("%s\n", *valtempUtf8);
	
	// ��ȡname
	Handle<Value> val1 = v8::Script::Compile(v8::String::New("config[\"name\"];"))->Run();
	String::Utf8Value config_name(val1);
	
	// ��ȡVersion����
	Handle<Value> val2 = v8::Script::Compile(v8::String::New("config.language;"))->Run();
	String::Utf8Value config_language(val2);
	
	// Dispose the persistent context.
	context.Dispose();
	
	delete json_config_stringclass;
	///////////////////////////////////////////////////////////////////////////////////////////////
	Local<Function> cb = Local<Function>::Cast(args[1]);
	const unsigned argc = 2;
	Local<Value> argv[argc] = { Local<Value>::New(String::New(ToCString(config_name))),Local<Value>::New(String::New(ToCString(config_language))) };
	cb->Call(Context::GetCurrent()->Global(), argc, argv);

	return scope.Close(Undefined());
}

// ��ʼ��ģ��
void init(Handle<Object> exports, Handle<Object> module) {
	//����Ŀ¼
	exports->Set(String::NewSymbol("travel_dir"),
		FunctionTemplate::New(travel_dir)->GetFunction());
		
	//д��json�ļ�
	exports->Set(String::NewSymbol("write_json_file"),
		FunctionTemplate::New(write_json_file)->GetFunction());
	//��ȡjson�ļ�
	exports->Set(String::NewSymbol("read_json_file"),
		FunctionTemplate::New(read_json_file)->GetFunction());
		
	//��ȡ��Ŀ·��
	exports->Set(String::NewSymbol("project_path"),
		FunctionTemplate::New(project_path)->GetFunction());
	
	//��ȡ�����ļ�
	exports->Set(String::NewSymbol("get_config_callback"),
		FunctionTemplate::New(get_config_callback)->GetFunction());

}

// ����"nodecpp"ģ��
NODE_MODULE(nodecpp, init)